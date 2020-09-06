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
import { Parser } from './parser';
import { ValueType } from './type';
import { Diagnostic } from '@codemirror/next/lint';
import { createEditorState } from '../../test/utils';

describe('Scalars and scalar-to-scalar operations', () => {
  const testSuites = [
    {
      expr: '1',
      expectedValueType: ValueType.scalar,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: '2 * 3',
      expectedValueType: ValueType.scalar,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'metric_name * "string"',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          message: 'binary expression must contain only scalar and instant vector types',
          severity: 'error',
          to: 11,
        },
      ] as Diagnostic[],
    },
  ];
  testSuites.forEach((value) => {
    const state = createEditorState(value.expr);
    const parser = new Parser(state);
    it(value.expr, () => {
      chai.expect(parser.checkAST(state.tree.firstChild)).to.equal(value.expectedValueType);
      chai.expect(parser.getDiagnostics()).to.deep.equal(value.expectedDiag);
    });
  });
});
