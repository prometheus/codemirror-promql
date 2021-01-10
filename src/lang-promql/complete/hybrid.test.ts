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
import { analyzeCompletion, computeStartCompletePosition, ContextKind, HybridComplete } from './hybrid';
import { createEditorState } from '../../test/utils';
import { Completion, CompletionContext } from '@codemirror/autocomplete';
import {
  aggregateOpModifierTerms,
  aggregateOpTerms,
  binOpModifierTerms,
  binOpTerms,
  durationTerms,
  functionIdentifierTerms,
  matchOpTerms,
  snippets,
} from './promql.terms';
import { EqlSingle, Neq } from 'lezer-promql';
import { syntaxTree } from '@codemirror/language';

describe('analyzeCompletion test', () => {
  const testCases = [
    {
      title: 'simple metric autocompletion',
      expr: 'go_',
      pos: 3, // cursor is at the end of the expr
      expectedContext: [{ kind: ContextKind.MetricName, metricName: 'go_' }, { kind: ContextKind.Function }, { kind: ContextKind.Aggregation }],
    },
    {
      title: 'metric/function/aggregation autocompletion',
      expr: 'sum()',
      pos: 4,
      expectedContext: [{ kind: ContextKind.MetricName, metricName: '' }, { kind: ContextKind.Function }, { kind: ContextKind.Aggregation }],
    },
    {
      title: 'metric/function/aggregation autocompletion 2',
      expr: 'sum(rat)',
      pos: 7,
      expectedContext: [{ kind: ContextKind.MetricName, metricName: 'rat' }, { kind: ContextKind.Function }, { kind: ContextKind.Aggregation }],
    },
    {
      title: 'metric/function/aggregation autocompletion 3',
      expr: 'sum(rate())',
      pos: 9,
      expectedContext: [{ kind: ContextKind.MetricName, metricName: '' }, { kind: ContextKind.Function }, { kind: ContextKind.Aggregation }],
    },
    {
      title: 'metric/function/aggregation autocompletion 4',
      expr: 'sum(rate(my_))',
      pos: 12,
      expectedContext: [{ kind: ContextKind.MetricName, metricName: 'my_' }, { kind: ContextKind.Function }, { kind: ContextKind.Aggregation }],
    },
    {
      title: 'autocomplete binOp modifier or metric',
      expr: 'metric_name / ignor',
      pos: 19,
      expectedContext: [
        { kind: ContextKind.MetricName, metricName: 'ignor' },
        { kind: ContextKind.Function },
        { kind: ContextKind.Aggregation },
        { kind: ContextKind.BinOpModifier },
      ],
    },
    {
      title: 'autocomplete binOp modifier or metric 2',
      expr: 'sum(http_requests_total{method="GET"} / o)',
      pos: 41,
      expectedContext: [
        { kind: ContextKind.MetricName, metricName: 'o' },
        { kind: ContextKind.Function },
        { kind: ContextKind.Aggregation },
        { kind: ContextKind.BinOpModifier },
      ],
    },
    {
      title: 'autocomplete bool or binOp modifier or metric 1',
      expr: '1 > b)',
      pos: 5,
      expectedContext: [
        { kind: ContextKind.MetricName, metricName: 'b' },
        { kind: ContextKind.Function },
        { kind: ContextKind.Aggregation },
        { kind: ContextKind.BinOpModifier },
        { kind: ContextKind.Bool },
      ],
    },
    {
      title: 'autocomplete bool or binOp modifier or metric 2',
      expr: '1 == b)',
      pos: 6,
      expectedContext: [
        { kind: ContextKind.MetricName, metricName: 'b' },
        { kind: ContextKind.Function },
        { kind: ContextKind.Aggregation },
        { kind: ContextKind.BinOpModifier },
        { kind: ContextKind.Bool },
      ],
    },
    {
      title: 'autocomplete bool or binOp modifier or metric 3',
      expr: '1 != b)',
      pos: 6,
      expectedContext: [
        { kind: ContextKind.MetricName, metricName: 'b' },
        { kind: ContextKind.Function },
        { kind: ContextKind.Aggregation },
        { kind: ContextKind.BinOpModifier },
        { kind: ContextKind.Bool },
      ],
    },
    {
      title: 'autocomplete bool or binOp modifier or metric 4',
      expr: '1 > b)',
      pos: 5,
      expectedContext: [
        { kind: ContextKind.MetricName, metricName: 'b' },
        { kind: ContextKind.Function },
        { kind: ContextKind.Aggregation },
        { kind: ContextKind.BinOpModifier },
        { kind: ContextKind.Bool },
      ],
    },
    {
      title: 'autocomplete bool or binOp modifier or metric 5',
      expr: '1 >= b)',
      pos: 6,
      expectedContext: [
        { kind: ContextKind.MetricName, metricName: 'b' },
        { kind: ContextKind.Function },
        { kind: ContextKind.Aggregation },
        { kind: ContextKind.BinOpModifier },
        { kind: ContextKind.Bool },
      ],
    },
    {
      title: 'autocomplete bool or binOp modifier or metric 6',
      expr: '1 <= b)',
      pos: 6,
      expectedContext: [
        { kind: ContextKind.MetricName, metricName: 'b' },
        { kind: ContextKind.Function },
        { kind: ContextKind.Aggregation },
        { kind: ContextKind.BinOpModifier },
        { kind: ContextKind.Bool },
      ],
    },
    {
      title: 'autocomplete bool or binOp modifier or metric 7',
      expr: '1 < b)',
      pos: 5,
      expectedContext: [
        { kind: ContextKind.MetricName, metricName: 'b' },
        { kind: ContextKind.Function },
        { kind: ContextKind.Aggregation },
        { kind: ContextKind.BinOpModifier },
        { kind: ContextKind.Bool },
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
      expectedContext: [
        {
          kind: ContextKind.LabelValue,
          metricName: 'metric_name',
          labelName: 'labelName',
          matchers: [
            {
              name: 'labelName',
              type: EqlSingle,
              value: '',
            },
          ],
        },
      ],
    },
    {
      title: 'autocomplete the labelValue with metricName + labelName 2',
      expr: 'metric_name{labelName="labelValue", labelName!=""}',
      pos: 48, // cursor is between the quotes
      expectedContext: [
        {
          kind: ContextKind.LabelValue,
          metricName: 'metric_name',
          labelName: 'labelName',
          matchers: [
            {
              name: 'labelName',
              type: EqlSingle,
              value: 'labelValue',
            },
            {
              name: 'labelName',
              type: Neq,
              value: '',
            },
          ],
        },
      ],
    },
    {
      title: 'autocomplete the labelValue associated to a labelName',
      expr: '{labelName=""}',
      pos: 12, // cursor is between the quotes
      expectedContext: [
        {
          kind: ContextKind.LabelValue,
          metricName: '',
          labelName: 'labelName',
          matchers: [
            {
              name: 'labelName',
              type: EqlSingle,
              value: '',
            },
          ],
        },
      ],
    },
    {
      title: 'autocomplete the labelValue associated to a labelName 2',
      expr: '{labelName="labelValue", labelName!=""}',
      pos: 37, // cursor is between the quotes
      expectedContext: [
        {
          kind: ContextKind.LabelValue,
          metricName: '',
          labelName: 'labelName',
          matchers: [
            {
              name: 'labelName',
              type: EqlSingle,
              value: 'labelValue',
            },
            {
              name: 'labelName',
              type: Neq,
              value: '',
            },
          ],
        },
      ],
    },
    {
      title: 'autocomplete AggregateOpModifier or BinOp',
      expr: 'sum() b',
      pos: 7, // cursor is after the 'b'
      expectedContext: [{ kind: ContextKind.AggregateOpModifier }, { kind: ContextKind.BinOp }],
    },
    {
      title: 'autocomplete AggregateOpModifier or BinOp 2',
      expr: 'sum(rate(foo[5m])) an',
      pos: 21,
      expectedContext: [{ kind: ContextKind.AggregateOpModifier }, { kind: ContextKind.BinOp }],
    },
    {
      title: 'autocomplete AggregateOpModifier or BinOp or Offset',
      expr: 'sum b',
      pos: 5, // cursor is after 'b'
      expectedContext: [{ kind: ContextKind.AggregateOpModifier }, { kind: ContextKind.BinOp }, { kind: ContextKind.Offset }],
    },
    {
      title: 'autocomplete binOp',
      expr: 'metric_name !',
      pos: 13,
      expectedContext: [{ kind: ContextKind.BinOp }],
    },
    {
      title: 'autocomplete binOp 2',
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
      title: 'autocomplete duration with offset',
      expr: 'sum(http_requests_total{method="GET"} offset 4)',
      pos: 46,
      expectedContext: [{ kind: ContextKind.Duration }],
    },
    {
      title: 'autocomplete offset or binOp',
      expr: 'http_requests_total off',
      pos: 23,
      expectedContext: [{ kind: ContextKind.BinOp }, { kind: ContextKind.Offset }],
    },
    {
      title: 'autocomplete offset or binOp 2',
      expr: 'metric_name unle',
      pos: 16,
      expectedContext: [{ kind: ContextKind.BinOp }, { kind: ContextKind.Offset }],
    },
    {
      title: 'autocomplete offset or binOp 3',
      expr: 'http_requests_total{method="GET"} off',
      pos: 37,
      expectedContext: [{ kind: ContextKind.BinOp }, { kind: ContextKind.Offset }],
    },
    {
      title: 'autocomplete offset or binOp 4',
      expr: 'rate(foo[5m]) un',
      pos: 16,
      expectedContext: [{ kind: ContextKind.BinOp }, { kind: ContextKind.Offset }],
    },
    {
      title: 'not autocompleting duration for a matrixSelector',
      expr: 'go[]',
      pos: 3,
      expectedContext: [],
    },
    {
      title: 'not autocompleting duration for a matrixSelector 2',
      expr: 'go{l1="l2"}[]',
      pos: 12,
      expectedContext: [],
    },
    {
      title: 'autocomplete duration for a matrixSelector',
      expr: 'go[5]',
      pos: 4,
      expectedContext: [{ kind: ContextKind.Duration }],
    },
    {
      title: 'autocomplete duration for a matrixSelector 2',
      expr: 'rate(my_metric{l1="l2"}[25])',
      pos: 26,
      expectedContext: [{ kind: ContextKind.Duration }],
    },
  ];
  testCases.forEach((value) => {
    it(value.title, () => {
      const state = createEditorState(value.expr);
      const node = syntaxTree(state).resolve(value.pos, -1);
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
      title: 'empty bracket 4',
      expr: 'sum by(test) ()',
      pos: 14, // cursor is between the bracket
      expectedStart: 14,
    },
    {
      title: 'empty bracket 5',
      expr: 'sum()',
      pos: 4, // cursor is between the bracket
      expectedStart: 4,
    },
    {
      title: 'empty bracket 6',
      expr: 'sum(rate())',
      pos: 9, // cursor is between the bracket
      expectedStart: 9,
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
      title: 'bracket containing a substring 3',
      expr: 'sum(ra)',
      pos: 6, // cursor is between the bracket
      expectedStart: 4,
    },
    {
      title: 'bracket containing a substring 3',
      expr: 'sum(rate(my))',
      pos: 11, // cursor is between the bracket
      expectedStart: 9,
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
    {
      title: 'start should be equal to the pos for the duration of an offset 4',
      expr: 'sum(http_requests_total{method="GET"} offset 4)',
      pos: 46,
      expectedStart: 46,
    },
    {
      title: 'start should not be equal to the pos for the duration in a matrix selector',
      expr: 'go[]',
      pos: 3,
      expectedStart: 0,
    },
    {
      title: 'start should be equal to the pos for the duration in a matrix selector',
      expr: 'go[5]',
      pos: 4,
      expectedStart: 4,
    },
    {
      title: 'start should be equal to the pos for the duration in a matrix selector 2',
      expr: 'rate(my_metric{l1="l2"}[25])',
      pos: 26,
      expectedStart: 26,
    },
  ];
  testCases.forEach((value) => {
    it(value.title, () => {
      const state = createEditorState(value.expr);
      const node = syntaxTree(state).resolve(value.pos, -1);
      const result = computeStartCompletePosition(node, value.pos);
      chai.expect(value.expectedStart).to.equal(result);
    });
  });
});

describe('autocomplete promQL test', () => {
  const testCases = [
    {
      title: 'offline simple function/aggregation autocompletion',
      expr: 'go_',
      pos: 3,
      prometheusClient: undefined,
      expectedResult: {
        options: ([] as Completion[]).concat(functionIdentifierTerms, aggregateOpTerms, snippets),
        from: 0,
        to: 3,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline function/aggregation autocompletion in aggregation',
      expr: 'sum()',
      pos: 4,
      prometheusClient: undefined,
      expectedResult: {
        options: ([] as Completion[]).concat(functionIdentifierTerms, aggregateOpTerms, snippets),
        from: 4,
        to: 4,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline function/aggregation autocompletion in aggregation 2',
      expr: 'sum(ra)',
      pos: 6,
      prometheusClient: undefined,
      expectedResult: {
        options: ([] as Completion[]).concat(functionIdentifierTerms, aggregateOpTerms, snippets),
        from: 4,
        to: 6,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline function/aggregation autocompletion in aggregation 3',
      expr: 'sum(rate())',
      pos: 9,
      prometheusClient: undefined,
      expectedResult: {
        options: ([] as Completion[]).concat(functionIdentifierTerms, aggregateOpTerms, snippets),
        from: 9,
        to: 9,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline function/aggregation autocompletion in aggregation 4',
      expr:
        'sum by (instance, job) ( sum_over(scrape_series_added[1h])) / sum by (instance, job) (sum_over_time(scrape_samples_scraped[1h])) > 0.1 and sum by(instance, job) (scrape_samples_scraped{) > 100',
      pos: 33,
      prometheusClient: undefined,
      expectedResult: {
        options: ([] as Completion[]).concat(functionIdentifierTerms, aggregateOpTerms, snippets),
        from: 25,
        to: 33,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'autocomplete binOp modifier or metric',
      expr: 'metric_name / ignor',
      pos: 19,
      prometheusClient: undefined,
      expectedResult: {
        options: ([] as Completion[]).concat(functionIdentifierTerms, aggregateOpTerms, binOpModifierTerms, snippets),
        from: 14,
        to: 19,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'autocomplete binOp modifier or metric 2',
      expr: 'sum(http_requests_total{method="GET"} / o)',
      pos: 41,
      prometheusClient: undefined,
      expectedResult: {
        options: ([] as Completion[]).concat(functionIdentifierTerms, aggregateOpTerms, binOpModifierTerms, snippets),
        from: 40,
        to: 41,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete labelName return nothing',
      expr: 'sum by ()',
      pos: 8, // cursor is between the bracket
      prometheusClient: undefined,
      expectedResult: {
        options: [],
        from: 8,
        to: 8,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete labelName return nothing 2',
      expr: 'sum by (myL)',
      pos: 11, // cursor is between the bracket after the string myL
      expectedResult: {
        options: [],
        from: 8,
        to: 11,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete labelName return nothing 3',
      expr: 'sum by (myLabel1, myLab)',
      pos: 23, // cursor is between the bracket after the string myLab
      expectedResult: {
        options: [],
        from: 18,
        to: 23,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete labelName return nothing 4',
      expr: 'metric_name{}',
      pos: 12, // cursor is between the bracket
      expectedResult: {
        options: [],
        from: 12,
        to: 12,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete labelName return nothing 5',
      expr: '{}',
      pos: 1, // cursor is between the bracket
      expectedResult: {
        options: [],
        from: 1,
        to: 1,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete labelName return nothing 6',
      expr: 'metric_name{myL}',
      pos: 15, // cursor is between the bracket after the string myL
      expectedResult: {
        options: [],
        from: 12,
        to: 15,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete labelName return nothing 7',
      expr: '{myL}',
      pos: 4, // cursor is between the bracket after the string myL
      expectedResult: {
        options: [],
        from: 1,
        to: 4,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete labelValue return nothing',
      expr: 'metric_name{labelName=""}',
      pos: 23, // cursor is between the quotes
      expectedResult: {
        options: [],
        from: 23,
        to: 23,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete labelValue return nothing 2',
      expr: '{labelName=""}',
      pos: 12, // cursor is between the quotes
      expectedResult: {
        options: [],
        from: 12,
        to: 12,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete aggregate operation modifier or binary operator',
      expr: 'sum() b',
      pos: 7, // cursor is between the quotes
      expectedResult: {
        options: ([] as Completion[]).concat(aggregateOpModifierTerms, binOpTerms),
        from: 6,
        to: 7,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete aggregate operation modifier or binary operator 2',
      expr: 'sum(rate(foo[5m])) an',
      pos: 21, // cursor is between the quotes
      expectedResult: {
        options: ([] as Completion[]).concat(aggregateOpModifierTerms, binOpTerms),
        from: 19,
        to: 21,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete aggregate operation modifier or binary operator or offset',
      expr: 'sum b',
      pos: 5, // cursor is after 'b'
      expectedResult: {
        options: ([] as Completion[]).concat(aggregateOpModifierTerms, binOpTerms, [{ label: 'offset' }]),
        from: 4,
        to: 5,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete binOp',
      expr: 'metric_name !',
      pos: 13,
      expectedResult: {
        options: binOpTerms,
        from: 12,
        to: 13,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete binOp 2',
      expr: 'metric_name =',
      pos: 13,
      expectedResult: {
        options: binOpTerms,
        from: 12,
        to: 13,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete matchOp',
      expr: 'go{instance=""}',
      pos: 12, // cursor is after the 'equal'
      expectedResult: {
        options: matchOpTerms,
        from: 11,
        to: 12,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete matchOp 2',
      expr: 'metric_name{labelName!}',
      pos: 22, // cursor is after '!'
      expectedResult: {
        options: matchOpTerms,
        from: 21,
        to: 22,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete duration with offset',
      expr: 'http_requests_total offset 5',
      pos: 28,
      expectedResult: {
        options: durationTerms,
        from: 28,
        to: 28,
        span: undefined,
      },
    },
    {
      title: 'offline autocomplete duration with offset 2',
      expr: 'sum(http_requests_total{method="GET"} offset 4)',
      pos: 46,
      expectedResult: {
        options: durationTerms,
        from: 46,
        to: 46,
        span: undefined,
      },
    },
    {
      title: 'offline autocomplete offset or binOp',
      expr: 'http_requests_total off',
      pos: 23,
      expectedResult: {
        options: ([] as Completion[]).concat(binOpTerms, [{ label: 'offset' }]),
        from: 20,
        to: 23,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete offset or binOp 2',
      expr: 'metric_name unle',
      pos: 16,
      expectedResult: {
        options: ([] as Completion[]).concat(binOpTerms, [{ label: 'offset' }]),
        from: 12,
        to: 16,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete offset or binOp 3',
      expr: 'http_requests_total{method="GET"} off',
      pos: 37,
      expectedResult: {
        options: ([] as Completion[]).concat(binOpTerms, [{ label: 'offset' }]),
        from: 34,
        to: 37,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete offset or binOp 4',
      expr: 'rate(foo[5m]) un',
      pos: 16,
      expectedResult: {
        options: ([] as Completion[]).concat(binOpTerms, [{ label: 'offset' }]),
        from: 14,
        to: 16,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline not autocompleting duration for a matrixSelector',
      expr: 'go[]',
      pos: 3,
      expectedResult: {
        options: [],
        from: 0,
        to: 3,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline not autocompleting duration for a matrixSelector 2',
      expr: 'go{l1="l2"}[]',
      pos: 12,
      expectedResult: {
        options: [],
        from: 0,
        to: 12,
        span: /^[a-zA-Z0-9_:]+$/,
      },
    },
    {
      title: 'offline autocomplete duration for a matrixSelector',
      expr: 'go[5]',
      pos: 4,
      expectedResult: {
        options: durationTerms,
        from: 4,
        to: 4,
        span: undefined,
      },
    },
    {
      title: 'offline autocomplete duration for a matrixSelector 2',
      expr: 'rate(my_metric{l1="l2"}[25])',
      pos: 26,
      expectedResult: {
        options: durationTerms,
        from: 26,
        to: 26,
        span: undefined,
      },
    },
  ];
  testCases.forEach((value) => {
    it(value.title, async () => {
      const state = createEditorState(value.expr);
      const context = new CompletionContext(state, value.pos, true);
      const completion = new HybridComplete(value.prometheusClient);
      const result = await completion.promQL(context);
      chai.expect(value.expectedResult).to.deep.equal(result);
    });
  });
});
