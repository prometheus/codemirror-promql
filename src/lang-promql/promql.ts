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

import { LezerSyntax } from '@codemirror/next/syntax';
import { parser } from 'lezer-promql';
import { styleTags } from '@codemirror/next/highlight';
import { Extension } from '@codemirror/next/state';
import { CompleteConfiguration, CompleteStrategy, newCompleteStrategy } from './complete';
import { AutocompleteContext } from '@nexucis/codemirror-next-autocomplete';
import { LintConfiguration, LintStrategy, newLintStrategy, promQLLinter } from './lint';

export const promQLSyntax = LezerSyntax.define(
  parser.withProps(
    styleTags({
      LineComment: 'comment',
      LabelName: 'labelName',
      StringLiteral: 'string',
      NumberLiteral: 'number',
      Duration: 'number',
      'abs absent absent_over_time avg_over_time ceil changes clamp_max clamp_min count_over_time days_in_month day_of_month day_of_week delta deriv exp floor histogram_quantile holt_winters hour idelta increase irate label_replace label_join ln log10 log2 max_over_time min_over_time minute month predict_linear quantile_over_time rate resets round scalar sort sort_desc sqrt stddev_over_time stdvar_over_time sum_over_time time timestamp vector year':
        'functionName',
      'Avg Bottomk Count Count_values Group Max Min Quantile Stddev Stdvar Sum Topk': 'operatorKeyword',
      'By Without Bool On Ignoring GroupLeft GroupRight Offset': 'modifier',
      'And Unless Or': 'logicOperator',
      BinOp: 'operator',
      MatchOp: 'compareOperator',
      UnaryOp: 'arithmeticOperator',
      '( )': 'paren',
      '[ ]': 'squareBracket',
      '{ }': 'brace',
      '⚠': 'invalid',
    })
  ),
  {
    languageData: {
      closeBrackets: { brackets: ['(', '[', '{', "'", '"', '`'] },
      commentTokens: { line: '#' },
    },
  }
);

/**
 * This class holds the state of the completion extension for CodeMirror and allow hot-swapping the complete strategy.
 */
export class PromQLExtension {
  private complete: CompleteStrategy;
  private lint: LintStrategy;

  constructor() {
    this.complete = newCompleteStrategy();
    this.lint = newLintStrategy();
  }

  setComplete(conf?: CompleteConfiguration) {
    this.complete = newCompleteStrategy(conf);
  }

  setLinter(conf?: LintConfiguration) {
    this.lint = newLintStrategy(conf);
  }

  asExtension(): Extension {
    const completion = promQLSyntax.languageData.of({
      autocomplete: (context: AutocompleteContext) => {
        return this.complete.promQL(context);
      },
    });
    return [promQLSyntax, completion, promQLLinter(this.lint.promQL, this.lint)];
  }
}
