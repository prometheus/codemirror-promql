export const PromQLLightGrammar = {
// prefix ID for regular expressions, represented as strings, used in the grammar
  "RegExpID": "RE::",
  "Style": {
    "Comment": "comment",
    "LabelKeyString": "variable",
    "LabelValueString": "string",
    "Duration": "number",
    "Integer": "number",
    "Aggregation": "keyword",
    "AggregationVectorMatching": "keyword",
    "AggregationWithParameter": "keyword",
    "AggregationOverTime": "keyword",
    "LabelMatchingOperator": "operator",
    "ArithmeticBinaryOperator": "operator",
    "ComparisonBinaryOperator": "operator",
    "LogicalBinaryOperator": "operator"
  },
// Lexical model
  "Lex": {
    "Comment:comment": [ "#", null ],
    "MetricName": {
      "type": "simple",
      "tokens": [
        "RE::/[a-zA-Z0-9_-]+/"
      ],
      "except": [
        "sum",
        "min",
        "max",
        "avg",
        "stddev",
        "stdvar",
        "count",
        "count_values",
        "quantile",
        "topk",
        "bottomk",
        "sum_over_time",
        "min_over_time",
        "max_over_time",
        "avg_over_time",
        "stddev_over_time",
        "stdvar_over_time",
        "count_over_time",
        "and",
        "or",
        "unless",
        "on",
        "ignoring",
        "group_right",
        "group_left",
        "by",
        "without"
      ]
    },
    "LabelKeyString": "RE::/[a-zA-Z0-9_-]+/",
    "LabelValueString": {
      "type": "escaped-block",
      "escape": "\\",
      "tokens": [ "RE::/([\'\"`])/", 1 ]
    },
    "Duration": "RE::/\\d+(s|m|h|d|w|y)/",
    "Integer": "RE::/\\d+/",
    "Aggregation": {
      "autocomplete": true,
      "tokens": [
        "sum",
        "min",
        "max",
        "avg",
        "stddev",
        "stdvar",
        "count"
      ]
    },
    "AggregationWithParameter": {
      "autocomplete": true,
      "tokens": [
        "count_values",
        "quantile",
        "topk",
        "bottomk"
      ]
    },
    "AggregationOverTime": {
      "autocomplete": true,
      "tokens": [
        "sum_over_time",
        "min_over_time",
        "max_over_time",
        "avg_over_time",
        "stddev_over_time",
        "stdvar_over_time",
        "count_over_time"
      ]
    },
    "LabelMatchingOperator": {
      "autocomplete": true,
      "tokens": [
        "=",
        "!=",
        "=~",
        "!~"
      ]
    },
    "ArithmeticBinaryOperator": {
      "autocomplete": true,
      "tokens": [
        "+", "-", "*", "/", "%", "^"
      ]
    },
    "ComparisonBinaryOperator": {
      "autocomplete": true,
      "tokens": [
        "==", "!=", ">", "<", "<=", ">="
      ]
    },
    "LogicalBinaryOperator": {
      "autocomplete": true,
      "tokens": [
        "and", "or", "unless"
      ]
    },
    "VectorOneToOneMatching": {
      "autocomplete": true,
      "tokens": [
        "on", "ignoring"
      ]
    },
    "VectorOneToManyMatching": {
      "autocomplete": true,
      "tokens": [
        "group_right", "group_left"
      ]
    },
    "AggregationVectorMatching": {
      "autocomplete": true,
      "tokens": [
        "by", "without"
      ]
    }
  },
// Syntax model
  "Syntax": {
    "BinaryOperator": "ArithmeticBinaryOperator | ComparisonBinaryOperator | LogicalBinaryOperator",
    "LabelKeyStringList": "LabelKeyString (, LabelKeyString)*",
    "LabelExpr": "LabelKeyString LabelMatchingOperator ( LabelValueString | Integer )",
    "SimpleInstantVector": "MetricName ('{' LabelExpr (',' LabelExpr)* '}')?",
    "SimpleRangeVector": "SimpleInstantVector '[' Duration ']'",
    "AggregationOp": "Aggregation ('(' SimpleInstantVector ')' ( AggregationVectorMatching '(' LabelKeyStringList ')' )? | ( AggregationVectorMatching '(' LabelKeyStringList ')' )? '(' SimpleInstantVector ')')",
    "InstantVector": "AggregationOp | SimpleInstantVector",
    "Vector": "SimpleRangeVector | InstantVector",
    "PromQLExpr": "Comment | Vector"
  },
  "Parser": [ [ "PromQLExpr" ] ]
};
