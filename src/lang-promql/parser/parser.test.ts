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
      expr: '1 unless 1',
      expectedValueType: ValueType.scalar,
      expectedDiag: [
        {
          from: 0,
          to: 10,
          message: 'set operator not allowed in binary scalar expression',
          severity: 'error',
        },
      ],
    },
    {
      expr: 'metric_name * "string"',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 14,
          to: 22,
          message: 'binary expression must contain only scalar and instant vector types',
          severity: 'error',
        },
      ] as Diagnostic[],
    },
    {
      expr: 'metric_name_1 > bool metric_name_2',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'metric_name_1 + bool metric_name_2',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 34,
          message: 'bool modifier can only be used on comparison operators',
          severity: 'error',
        },
      ] as Diagnostic[],
    },
    {
      expr: 'metric_name offset 1d',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'metric_name[5m] offset 1d',
      expectedValueType: ValueType.matrix,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'rate(metric_name[5m])[1h:] offset 1m',
      expectedValueType: ValueType.matrix,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'sum(metric_name offset 1m)',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'rate(metric_name[5m] offset 1d)',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'max_over_time(rate(metric_name[5m])[1h:] offset 1m)',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo * bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo*bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo* bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo *bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo==bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo * sum',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo == 1',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo == bool 1',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: '2.5 / bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo and bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo or bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo unless bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      // Test and/or precedence and reassigning of operands.
      // Here it will test only the first VectorMatching so (a + b) or (c and d) ==> ManyToMany
      expr: 'foo + bar or bla and blub',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      // Test and/or/unless precedence.
      // Here it will test only the first VectorMatching so ((a and b) unless c) or d ==> ManyToMany
      expr: 'foo and bar unless baz or qux',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo * on(test,blub) bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo*on(test,blub)bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo * on(test,blub) group_left bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo*on(test,blub)group_left()bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo and on(test,blub) bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo and on() bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo and ignoring(test,blub) bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo and ignoring() bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo unless on(bar) baz',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo / on(test,blub) group_left(bar) bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo / ignoring(test,blub) group_left(blub) bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo / ignoring(test,blub) group_left(bar) bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo - on(test,blub) group_right(bar,foo) bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo - ignoring(test,blub) group_right(bar,foo) bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [] as Diagnostic[],
    },
    {
      expr: 'foo and 1',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 9,
          message: 'set operator not allowed in binary scalar expression',
          severity: 'error',
        },
      ],
    },
    {
      expr: '1 and foo',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 9,
          message: 'set operator not allowed in binary scalar expression',
          severity: 'error',
        },
      ],
    },
    {
      expr: 'foo or 1',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 8,
          message: 'set operator not allowed in binary scalar expression',
          severity: 'error',
        },
      ],
    },
    {
      expr: '1 or foo',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 8,
          message: 'set operator not allowed in binary scalar expression',
          severity: 'error',
        },
      ],
    },
    {
      expr: 'foo unless 1',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 12,
          message: 'set operator not allowed in binary scalar expression',
          severity: 'error',
        },
      ],
    },
    {
      expr: '1 unless foo',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 12,
          message: 'set operator not allowed in binary scalar expression',
          severity: 'error',
        },
      ],
    },
    {
      expr: '1 or on(bar) foo',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 16,
          message: 'vector matching only allowed between instant vectors',
          severity: 'error',
        },
        {
          from: 0,
          to: 16,
          message: 'set operator not allowed in binary scalar expression',
          severity: 'error',
        },
      ],
    },
    {
      expr: 'foo == on(bar) 10',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 17,
          message: 'vector matching only allowed between instant vectors',
          severity: 'error',
        },
      ],
    },
    {
      expr: 'foo and on(bar) group_left(baz) bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 35,
          message: 'no grouping allowed for set operations',
          severity: 'error',
        },
        {
          from: 0,
          to: 35,
          message: 'set operations must always be many-to-many',
          severity: 'error',
        },
      ],
    },
    {
      expr: 'foo and on(bar) group_right(baz) bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 36,
          message: 'no grouping allowed for set operations',
          severity: 'error',
        },
        {
          from: 0,
          to: 36,
          message: 'set operations must always be many-to-many',
          severity: 'error',
        },
      ],
    },
    {
      expr: 'foo or on(bar) group_left(baz) bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 34,
          message: 'no grouping allowed for set operations',
          severity: 'error',
        },
        {
          from: 0,
          to: 34,
          message: 'set operations must always be many-to-many',
          severity: 'error',
        },
      ],
    },
    {
      expr: 'foo or on(bar) group_right(baz) bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 35,
          message: 'no grouping allowed for set operations',
          severity: 'error',
        },
        {
          from: 0,
          to: 35,
          message: 'set operations must always be many-to-many',
          severity: 'error',
        },
      ],
    },
    {
      expr: 'foo unless on(bar) group_left(baz) bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 38,
          message: 'no grouping allowed for set operations',
          severity: 'error',
        },
        {
          from: 0,
          to: 38,
          message: 'set operations must always be many-to-many',
          severity: 'error',
        },
      ],
    },
    {
      expr: 'foo unless on(bar) group_right(baz) bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 39,
          message: 'no grouping allowed for set operations',
          severity: 'error',
        },
        {
          from: 0,
          to: 39,
          message: 'set operations must always be many-to-many',
          severity: 'error',
        },
      ],
    },
    {
      expr: 'http_requests{group="production"} + on(instance) group_left(job,instance) cpu_count{type="smp"}',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 95,
          message: 'label "instance" must not occur in ON and GROUP clause at once',
          severity: 'error',
        },
      ],
    },
    {
      expr: 'foo + bool bar',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 14,
          message: 'bool modifier can only be used on comparison operators',
          severity: 'error',
        },
      ],
    },
    {
      expr: 'foo + bool 10',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 13,
          message: 'bool modifier can only be used on comparison operators',
          severity: 'error',
        },
      ],
    },
    {
      expr: 'foo and bool 10',
      expectedValueType: ValueType.vector,
      expectedDiag: [
        {
          from: 0,
          to: 15,
          message: 'bool modifier can only be used on comparison operators',
          severity: 'error',
        },
        {
          from: 0,
          to: 15,
          message: 'set operator not allowed in binary scalar expression',
          severity: 'error',
        },
      ],
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
