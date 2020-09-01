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

import chai from 'chai';
import { BinaryExpr, Expr, FunctionCall, FunctionCallArgs, FunctionCallBody, NumberLiteral } from 'lezer-promql';
import { createEditorState } from '../../test/utils';
import { walkThrough } from './path-finder';

describe('walkThrough test', () => {
  const testSuites = [
    {
      title: 'should return the node when no path is given',
      expr: '1 > bool 2',
      pos: 0,
      expectedNode: Expr,
      path: [] as number[],
      expectedDoc: '1 > bool 2',
    },
    {
      title: 'should find the path',
      expr: "100 * (1 - avg by(instance)(irate(node_cpu{mode='idle'}[5m])))",
      pos: 11,
      path: [Expr, NumberLiteral],
      // for the moment the function walkThrough is not able to find the following path.
      // That's because the function is iterating through the tree by searching the first possible node that matched
      // the node ID path[i].
      // So for the current expression, and the given position we are in the sub expr (1 - avg ...).
      // Expr is matching 1 and not avg.
      // TODO fix this issue
      // path: [Expr, AggregateExpr, AggregateOp, Avg],
      expectedNode: NumberLiteral,
      expectedDoc: '1',
    },
    {
      title: 'should not find the path',
      expr: 'topk(10, count by (job)({__name__=~".+"}))',
      pos: 12,
      path: [Expr, BinaryExpr],
      expectedNode: undefined,
      expectedDoc: undefined,
    },
    {
      title: 'should find a node in a recursive node definition',
      expr: 'rate(1, 2, 3)',
      pos: 0,
      path: [FunctionCall, FunctionCallBody, FunctionCallArgs, FunctionCallArgs, Expr, NumberLiteral],
      expectedNode: NumberLiteral,
      expectedDoc: '2',
    },
  ];
  testSuites.forEach((value) => {
    it(value.title, () => {
      const state = createEditorState(value.expr);
      const subTree = state.tree.resolve(value.pos, -1);
      const tree = subTree.name === '' && subTree.firstChild ? subTree.firstChild : subTree;
      const node = walkThrough(tree, ...value.path);
      chai.expect(value.expectedNode).to.equal(node?.type.id);
      if (node) {
        chai.expect(value.expectedDoc).to.equal(state.sliceDoc(node.start, node.end));
      }
    });
  });
});
