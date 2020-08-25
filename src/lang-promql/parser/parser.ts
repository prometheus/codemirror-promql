// The MIT License (MIT)
//
// Copyright (c) 2020 The Prometheus Authors
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { Diagnostic } from '@codemirror/next/lint';
import { Subtree, Tree } from 'lezer-tree';
import {
  AggregateExpr,
  And,
  BinaryExpr,
  BinModifier,
  Bool,
  BoolModifier,
  Bottomk,
  CountValues,
  Eql,
  Expr,
  FunctionCall,
  FunctionCallArgs,
  FunctionCallBody,
  GroupModifiers,
  Gte,
  Gtr,
  Lss,
  Lte,
  MatrixSelector,
  Neq,
  NumberLiteral,
  Or,
  ParenExpr,
  Quantile,
  StringLiteral,
  SubqueryExpr,
  Topk,
  UnaryExpr,
  Unless,
  VectorSelector,
} from 'lezer-promql';
import { childExist, walkThrough } from './path-finder';

function sprintf(format: string, args: string[]): string {
  let i = 0;
  return format.replace(/%s/g, () => {
    return args[i++];
  });
}

type NodeType = string;

const NodeTypeVector: NodeType = 'vector',
  NodeTypeMatrix: NodeType = 'matrix',
  NodeTypeScalar: NodeType = 'scalar',
  NodeTypeString: NodeType = 'string',
  NodeTypeNone: NodeType = 'none';

export class Parser {
  private readonly tree: Tree;
  private readonly diagnostics: Diagnostic[];

  constructor(tree: Tree) {
    this.tree = tree;
    this.diagnostics = [];
  }

  getDiagnostics(): Diagnostic[] {
    return this.diagnostics.sort((a, b) => {
      return a.from - b.from;
    });
  }

  analyze() {
    this.checkAST(this.tree.resolve(0, -1));
  }

  // checkAST is inspired of the same named method from prometheus/prometheus:
  // https://github.com/prometheus/prometheus/blob/master/promql/parser/parse.go#L433
  private checkAST(node: Subtree | undefined | null): NodeType {
    if (!node) {
      return NodeTypeNone;
    }
    switch (node.type.id) {
      case Expr:
        return this.checkAST(node.firstChild);
      case AggregateExpr:
        this.checkAggregationExpr(node);
        break;
      case BinaryExpr:
        this.checkBinaryExpr(node);
        break;
      // TODO add FunctionCall management
      case FunctionCall:
        break;
      case ParenExpr:
        this.checkAST(walkThrough(node, Expr));
        break;
      case UnaryExpr:
        const unaryExprType = this.checkAST(walkThrough(node, Expr));
        if (unaryExprType !== NodeTypeScalar && unaryExprType != NodeTypeVector) {
          this.addDiagnostic(node, 'unary expression only allowed on expressions of type scalar or instant vector, got %s', unaryExprType);
        }
        break;
      case SubqueryExpr:
        const subQueryExprType = this.checkAST(walkThrough(node, Expr));
        if (subQueryExprType !== NodeTypeVector) {
          this.addDiagnostic(node, 'subquery is only allowed on instant vector, got %s in %s instead', subQueryExprType, node.name);
        }
        break;
      case MatrixSelector:
        this.checkAST(walkThrough(node, Expr));
    }
    if (node.name === '') {
      const child = node.firstChild;
      if (child !== null) {
        return this.checkAST(child);
      }
    }

    return this.getType(node);
  }

  private checkAggregationExpr(node: Subtree) {
    // according to https://github.com/promlabs/lezer-promql/blob/master/src/promql.grammar#L26
    // the name of the aggregator function is stored in the first child
    const aggregateOp = node.firstChild?.firstChild;
    if (!aggregateOp) {
      this.addDiagnostic(node, 'aggregation operator expected in aggregation expression but got nothing');
      return;
    }
    const expr = walkThrough(node, FunctionCallBody, FunctionCallArgs, Expr);
    if (!expr) {
      this.addDiagnostic(node, 'unable to find the parameter for the expression');
      return;
    }
    this.expectType(expr, NodeTypeVector, 'aggregation expression');
    // get the parameter of the aggregation operator
    const params = walkThrough(node, FunctionCallBody, FunctionCallArgs, FunctionCallArgs, Expr);
    if (aggregateOp.type.id == Topk || aggregateOp.type.id == Bottomk || aggregateOp.type.id == Quantile) {
      if (!params) {
        this.addDiagnostic(node, 'no parameter found');
        return;
      }
      this.expectType(params, NodeTypeScalar, 'aggregation parameter');
    }
    if (aggregateOp.type.id === CountValues) {
      if (!params) {
        this.addDiagnostic(node, 'no parameter found');
        return;
      }
      this.expectType(params, NodeTypeString, 'aggregation parameter');
    }
  }

  private checkBinaryExpr(node: Subtree): void {
    // Following the definition of the BinaryExpr, the left and the right and
    // expression are respectively the first and last child
    // https://github.com/promlabs/lezer-promql/blob/master/src/promql.grammar#L52
    const lExpr = node.firstChild;
    const rExpr = node.lastChild;
    if (!lExpr || !rExpr) {
      this.addDiagnostic(node, 'left or right expression is missing in binary expression');
      return;
    }
    const lt = this.checkAST(lExpr);
    const rt = this.checkAST(rExpr);
    const boolModifierUsed = walkThrough(node, BinModifier, GroupModifiers, BoolModifier, Bool);
    const isComparisonOperator = childExist(node, Eql, Neq, Lte, Lss, Gte, Gtr);
    const isSetOperator = childExist(node, And, Or, Unless);

    // BOOL modifier check
    if (boolModifierUsed) {
      if (!isComparisonOperator) {
        this.addDiagnostic(node, 'bool modifier can only be used on comparison operators');
      }
      if (lt !== NodeTypeScalar || rt !== NodeTypeScalar) {
        this.addDiagnostic(node, 'comparisons between other things than scalar cannot use BOOL modifier');
      }
    } else {
      if (lt === NodeTypeScalar || rt === NodeTypeScalar) {
        this.addDiagnostic(node, 'comparisons between scalars must use BOOL modifier');
      }
    }
    // TODO missing check regarding cardManyToOne or cardOneToMany
    // TODO missing check regarding the matching label
    if (lt !== NodeTypeScalar && lt !== NodeTypeVector) {
      this.addDiagnostic(lExpr, 'binary expression must contain only scalar and instant vector types');
    }
    if (lt !== NodeTypeScalar && lt !== NodeTypeVector) {
      this.addDiagnostic(rExpr, 'binary expression must contain only scalar and instant vector types');
    }
    if ((lt === NodeTypeScalar || rt === NodeTypeScalar) && isSetOperator) {
      this.addDiagnostic(node, 'set operator not allowed in binary scalar expression');
    }
  }

  private expectType(node: Subtree, want: NodeType, context: string): void {
    const t = this.checkAST(node);
    if (t !== want) {
      this.addDiagnostic(node, 'expected type %s in %s, got %s', want, context, t);
    }
  }

  private addDiagnostic(node: Subtree, format: string, ...args: string[]): void {
    this.diagnostics.push({
      severity: 'error',
      message: sprintf(format, args),
      from: node.start,
      to: node.end,
    });
  }

  // Based on https://github.com/prometheus/prometheus/blob/d668a7efe3107dbdcc67bf4e9f12430ed8e2b396/promql/parser/ast.go#L191
  private getType(node: Subtree | null | undefined): NodeType {
    if (!node) {
      return NodeTypeNone;
    }
    switch (node.type.id) {
      case Expr:
        return this.getType(node.firstChild);
      case AggregateExpr:
        return NodeTypeVector;
      case VectorSelector:
        return NodeTypeVector;
      case StringLiteral:
        return NodeTypeString;
      case NumberLiteral:
        return NodeTypeScalar;
      case MatrixSelector:
        return NodeTypeMatrix;
      case SubqueryExpr:
        return NodeTypeMatrix;
      case ParenExpr:
        return this.getType(walkThrough(node, Expr));
      case UnaryExpr:
        return this.getType(walkThrough(node, Expr));
      case BinaryExpr:
        const lt = this.getType(node.firstChild);
        const rt = this.getType(node.lastChild);
        if (lt === NodeTypeScalar && rt === NodeTypeScalar) {
          return NodeTypeScalar;
        }
        // TODO what happen if you have a stringLiteral instead
        return NodeTypeVector;
      default:
        return NodeTypeNone;
    }
  }
}
