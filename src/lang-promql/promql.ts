import { LezerSyntax } from "@codemirror/next/syntax";
import { parser } from "lezer-promql";
import { styleTags } from "@codemirror/next/highlight";
import { Extension } from "@codemirror/next/state";

export const promQLSyntax = new LezerSyntax(parser.withProps(
  styleTags({
    LineComment: "comment",
    LabelName: "labelName",
    StringLiteral: "string",
    NumberLiteral: "number",
    Duration: "number",
    "abs absent absent_over_time avg_over_time ceil changes clamp_max clamp_min count_over_time days_in_month day_of_month day_of_week delta deriv exp floor histogram_quantile holt_winters hour idelta increase irate label_replace label_join ln log10 log2 max_over_time min_over_time minute month predict_linear quantile_over_time rate resets round scalar sort sort_desc sqrt stddev_over_time stdvar_over_time sum_over_time time timestamp vector year": "keyword",
    "avg bottomk count count_values max min quantile stddev stdvar sum topk": "keyword",
    "by without bool on ignoring group_left group_right offset": "modifier",
    "and unless or": "operator",
    BinOp: "operator",
    MatchOp: "operator",
    UnaryOp: "operator",
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

/// Returns an extension that installs the PromQL syntax
export function promQL(): Extension {
  return [ promQLSyntax ]
}
