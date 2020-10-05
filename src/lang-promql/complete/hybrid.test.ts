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
import { analyzeCompletion, computeStartCompletePosition, ContextKind } from './hybrid';
import { createEditorState } from '../../test/utils';

describe('analyzeCompletion test', () => {
  const testCases = [
    {
      title: 'simple metric autocompletion',
      expr: 'go_',
      pos: 3, // cursor is at the end of the expr
      expectedContext: [{ kind: ContextKind.MetricName }, { kind: ContextKind.Function }, { kind: ContextKind.Aggregation }],
    },
    {
      title: 'autocomplete binOp modifier',
      expr: 'metric_name / ignor',
      pos: 19,
      expectedContext: [
        { kind: ContextKind.MetricName },
        { kind: ContextKind.Function },
        { kind: ContextKind.Aggregation },
        { kind: ContextKind.BinOpModifier },
      ],
    },
    {
      title: 'starting to autocomplete labelName in aggregate modifier',
      expr: 'sum by ()',
      pos: 8, // cursor is between the bracket
      expectedContext: [{ kind: ContextKind.LabelName }],
    },
    {
      title: 'continue to autocomplete labelName in aggregate modifier',
      expr: 'sum by (myL)',
      pos: 11, // cursor is between the bracket after the string myL
      expectedContext: [{ kind: ContextKind.LabelName }],
    },
    {
      title: 'autocomplete labelName in a list',
      expr: 'sum by (myLabel1, myLab)',
      pos: 23, // cursor is between the bracket after the string myLab
      expectedContext: [{ kind: ContextKind.LabelName }],
    },
    {
      title: 'autocomplete labelName associated to a metric',
      expr: 'metric_name{}',
      pos: 12, // cursor is between the bracket
      expectedContext: [{ kind: ContextKind.LabelName, metricName: 'metric_name' }],
    },
    {
      title: 'autocomplete labelName that defined a metric',
      expr: '{}',
      pos: 1, // cursor is between the bracket
      expectedContext: [{ kind: ContextKind.LabelName, metricName: '' }],
    },
    {
      title: 'continue to autocomplete labelName associated to a metric',
      expr: 'metric_name{myL}',
      pos: 15, // cursor is between the bracket after the string myL
      expectedContext: [{ kind: ContextKind.LabelName, metricName: 'metric_name' }],
    },
    {
      title: 'continue autocomplete labelName that defined a metric',
      expr: '{myL}',
      pos: 4, // cursor is between the bracket after the string myL
      expectedContext: [{ kind: ContextKind.LabelName, metricName: '' }],
    },
    {
      title: 'autocomplete the labelValue with metricName + labelName',
      expr: 'metric_name{labelName=""}',
      pos: 23, // cursor is between the quotes
      expectedContext: [{ kind: ContextKind.LabelValue, metricName: 'metric_name', labelName: 'labelName' }],
    },
    {
      title: 'autocomplete aggregate operation modifier',
      expr: 'sum() b',
      pos: 7, // cursor is between the quotes
      expectedContext: [{ kind: ContextKind.AggregateOpModifier }],
    },
    {
      title: 'autocomplete aggregate operation modifier 2',
      expr: 'sum b',
      pos: 5, // cursor is after 'b'
      expectedContext: [{ kind: ContextKind.AggregateOpModifier }, { kind: ContextKind.BinOp }, { kind: ContextKind.Offset }],
    },
    {
      title: 'autocomplete binOp',
      expr: 'metric_name unle',
      pos: 16,
      expectedContext: [{ kind: ContextKind.BinOp }, { kind: ContextKind.Offset }],
    },
    {
      title: 'autocomplete binOp 2',
      expr: 'metric_name !',
      pos: 13,
      expectedContext: [{ kind: ContextKind.BinOp }],
    },
    {
      title: 'autocomplete binOp 3',
      expr: 'metric_name =',
      pos: 13,
      expectedContext: [{ kind: ContextKind.BinOp }],
    },
    {
      title: 'autocomplete matchOp',
      expr: 'go{instance=""}',
      pos: 12, // cursor is after the 'equal'
      expectedContext: [{ kind: ContextKind.MatchOp }],
    },
    {
      title: 'autocomplete matchOp 2',
      expr: 'metric_name{labelName!}',
      pos: 22, // cursor is after '!'
      expectedContext: [{ kind: ContextKind.MatchOp }],
    },
    {
      title: 'autocomplete duration with offset',
      expr: 'http_requests_total offset 5',
      pos: 28,
      expectedContext: [{ kind: ContextKind.Duration }],
    },
    {
      title: 'autocomplete offset',
      expr: 'http_requests_total off',
      pos: 23,
      expectedContext: [{ kind: ContextKind.BinOp }, { kind: ContextKind.Offset }],
    },
  ];
  testCases.forEach((value) => {
    it(value.title, () => {
      const state = createEditorState(value.expr);
      const node = state.tree.resolve(value.pos, -1);
      const result = analyzeCompletion(state, node);
      chai.expect(value.expectedContext).to.deep.equal(result);
    });
  });
});

describe('computeStartCompletePosition test', () => {
  const testCases = [
    {
      title: 'empty bracket',
      expr: '{}',
      pos: 1, // cursor is between the bracket
      expectedStart: 1,
    },
    {
      title: 'empty bracket 2',
      expr: 'metricName{}',
      pos: 11, // cursor is between the bracket
      expectedStart: 11,
    },
    {
      title: 'empty bracket 3',
      expr: 'sum by()',
      pos: 7, // cursor is between the bracket
      expectedStart: 7,
    },
    {
      title: 'bracket containing a substring',
      expr: '{myL}',
      pos: 4, // cursor is between the bracket
      expectedStart: 1,
    },
    {
      title: 'bracket containing a substring 2',
      expr: 'metricName{myL}',
      pos: 14, // cursor is between the bracket
      expectedStart: 11,
    },
    {
      title: 'bracket containing a substring 3',
      expr: 'sum by(myL)',
      pos: 10, // cursor is between the bracket
      expectedStart: 7,
    },
    {
      title: 'start should not be at the beginning of the substring',
      expr: 'metric_name{labelName!}',
      pos: 22,
      expectedStart: 21,
    },
    {
      title: 'start should not be at the beginning of the substring 2',
      expr: 'metric_name{labelName!="labelValue"}',
      pos: 22,
      expectedStart: 21,
    },
    {
      title: 'start should be equal to the pos for the duration of an offset',
      expr: 'http_requests_total offset 5',
      pos: 28,
      expectedStart: 28,
    },
    {
      title: 'start should be equal to the pos for the duration of an offset 2',
      expr: 'http_requests_total offset 587',
      pos: 30,
      expectedStart: 30,
    },
    {
      title: 'start should be equal to the pos for the duration of an offset 3',
      expr: 'http_requests_total offset 587',
      pos: 29,
      expectedStart: 29,
    },
  ];
  testCases.forEach((value) => {
    it(value.title, () => {
      const state = createEditorState(value.expr);
      const node = state.tree.resolve(value.pos, -1);
      const result = computeStartCompletePosition(node, value.pos);
      chai.expect(value.expectedStart).to.equal(result);
    });
  });
});
