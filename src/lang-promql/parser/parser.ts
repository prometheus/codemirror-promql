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
  Bottomk,
  CountValues,
  Expr,
  FunctionCallArgs,
  FunctionCallBody,
  MatrixSelector,
  NumberLiteral,
  ParenExpr,
  Quantile,
  StringLiteral,
  SubqueryExpr,
  Topk,
  UnaryExpr,
  VectorSelector,
} from 'lezer-promql';
import { walkThrough } from './path-finder';

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
    console.log(node);
    switch (node.type.id) {
      case Expr:
        return this.checkAST(node.firstChild);
      case AggregateExpr:
        this.checkAggregationExpr(node);
        break;
      case ParenExpr:
        this.checkAST(walkThrough(node, ParenExpr, Expr));
        break;
      case UnaryExpr:
        const unaryExprType = this.checkAST(walkThrough(node, UnaryExpr, Expr));
        if (unaryExprType !== NodeTypeScalar && unaryExprType != NodeTypeVector) {
          this.addDiagnostic(node, 'unary expression only allowed on expressions of type scalar or instant vector, got %s', unaryExprType);
        }
        break;
      case SubqueryExpr:
        const subQueryExprType = this.checkAST(walkThrough(node, SubqueryExpr, Expr));
        if (subQueryExprType !== NodeTypeVector) {
          this.addDiagnostic(node, 'subquery is only allowed on instant vector, got %s in %s instead', subQueryExprType, node.name);
        }
        break;
      case MatrixSelector:
        this.checkAST(walkThrough(node, MatrixSelector, Expr));
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
    const expr = walkThrough(node, AggregateExpr, FunctionCallBody, FunctionCallArgs, Expr);
    if (!expr) {
      this.addDiagnostic(node, 'unable to find the parameter for the expression');
      return;
    }
    this.expectType(expr, NodeTypeVector, 'aggregation expression');
    // get the parameter of the aggregation operator
    const params = walkThrough(node, AggregateExpr, FunctionCallBody, FunctionCallArgs, FunctionCallArgs, Expr);
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

  private getType(node: Subtree): NodeType {
    switch (node.type.id) {
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
      // TODO Missing recursive search nodeType for binary expr
      default:
        return NodeTypeNone;
    }
  }
}
