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

import { LezerSyntax } from "@codemirror/next/syntax";
import { parser } from "lezer-promql";
import { styleTags } from "@codemirror/next/highlight";
import { Extension } from "@codemirror/next/state";
import { completePromQL } from "./complete";

export const promQLSyntax = new LezerSyntax(parser.withProps(
  styleTags({
    LineComment: "comment",
    LabelName: "labelName",
    StringLiteral: "string",
    NumberLiteral: "number",
    Duration: "number",
    "abs absent absent_over_time avg_over_time ceil changes clamp_max clamp_min count_over_time days_in_month day_of_month day_of_week delta deriv exp floor histogram_quantile holt_winters hour idelta increase irate label_replace label_join ln log10 log2 max_over_time min_over_time minute month predict_linear quantile_over_time rate resets round scalar sort sort_desc sqrt stddev_over_time stdvar_over_time sum_over_time time timestamp vector year": "functionName",
    "avg bottomk count count_values group max min quantile stddev stdvar sum topk": "operatorKeyword",
    "by without bool on ignoring group_left group_right offset": "modifier",
    "and unless or": "logicOperator",
    BinOp: "operator",
    MatchOp: "compareOperator",
    UnaryOp: "arithmeticOperator",
    "( )": "paren",
    "[ ]": "squareBracket",
    "{ }": "brace",
    "⚠": "invalid",
  })
), {
  languageData: {
    closeBrackets: {brackets: [ '(', '[', '{', "'", '"', '`' ]},
    commentTokens: {line: '#'},
  },
})

export const promQLCompletion = promQLSyntax.languageData.of({autocomplete: completePromQL})

/// Returns an extension that installs the PromQL syntax
export function promQL(): Extension {
  return [ promQLSyntax, promQLCompletion ]
}
