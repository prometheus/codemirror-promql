export const PromQLLightGrammar = {
// prefix ID for regular expressions, represented as strings, used in the grammar
  "RegExpID": "RE::",
  "Style": {
    "Comment": "comment",
    "LabelKeyString": "variable",
    "LabelValueString": "string",
    "Aggregation": "keyword",
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
    "String": "RE::/[a-zA-Z0-9_-]+/",
    "StringList": "RE::/[a-zA-Z0-9_-]+( *, *[a-zA-Z0-9_-])*/",
    "LabelKeyString": "RE::/[a-zA-Z0-9_-]+/",
    "LabelValueString": {
      "type": "escaped-block",
      "escape": "\\",
      "tokens": [ "RE::/([\'\"`])/", 1 ]
    },
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
    "LabelExpr": "LabelKeyString LabelMatchingOperator LabelValueString",
    "SimpleInstantVector": "String ('{' LabelExpr (',' LabelExpr)* '}')?",
    "Vector": "SimpleInstantVector",
    "PromQLExpr": "Comment | SimpleInstantVector"
  },
  "Parser": [ [ "PromQLExpr" ] ]
};
