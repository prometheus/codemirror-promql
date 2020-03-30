export const PromQLLightGrammar = {
// prefix ID for regular expressions, represented as strings, used in the grammar
  "RegExpID": "RE::",
  "Style": {
    "Comment": "comment",
    "LabelKeyString": "variable",
    "LabelValueString": "string",
    "Duration": "number",
    "Number": "number",
    "Aggregation": "keyword",
    "AggregationWithParameter": "keyword",
    "AggregationOverTime": "keyword",
    "FunctionTakesInstantVectorReturnsInstantVector": "keyword",
    "FunctionTakesRangeVectorReturnsInstantVector": "keyword",
    "FunctionClamp": "keyword",
    "FunctionDay": "keyword",
    "LabelMatchingOperator": "operator",
    "ArithmeticBinaryOperator": "operator",
    "ComparisonBinaryOperator": "operator",
    "LogicalBinaryOperator": "operator",
    "AggregationVectorMatching": "operator",
    "VectorOneToOneMatching": "operator",
    "VectorOneToManyMatching": "operator",
  },
// Lexical model
  "Lex": {
    "Comment:comment": [ "#", null ],
    "MetricName": {
      "type": "simple",
      "tokens": [
        "RE::/[a-zA-Z_-]+/"
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
        'abs',
        'absent',
        'absent_over_time',
        'ceil',
        'changes',
        'clamp_max',
        'clamp_min',
        'day_of_month',
        'day_of_week',
        'days_in_month',
        'delta',
        'deriv',
        'exp',
        'floor',
        'histogram_quantile',
        'holt_winters',
        'hour',
        'idelta',
        'increase',
        'irate',
        'label_join',
        'label_replace',
        'ln',
        'log2',
        'log10',
        'minute',
        'month',
        'predict_linear',
        'rate',
        'resets',
        'round',
        'scalar',
        'sort',
        'sort_desc',
        'sqrt',
        'time',
        'timestamp',
        'vector',
        'year',
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
    "Number": "RE::/\\d*\\.?\\d+([eE][\\-+]?\\d+[fFlL]?)?/",
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
    },
    "FunctionTakesInstantVectorReturnsInstantVector": {
      "autocomplete": true,
      "tokens": [
        'abs',
        'absent',
        'ceil',
        'exp',
        'floor',
        'ln',
        'log2',
        'log10',
        'sort',
        'sort_desc',
        'sqrt',
      ]
    },
    "FunctionTakesRangeVectorReturnsInstantVector": {
      "autocomplete": true,
      "tokens": [
        'absent_over_time',
        'changes',
        'delta',
        'deriv',
        'idelta',
        'increase',
        'irate',
        'rate',
        'resets',
      ]
    },
    "FunctionClamp": {
      "autocomplete": true,
      "tokens": [
        'clamp_max',
        'clamp_min',
      ]
    },
    "FunctionDay": {
      "autocomplete": true,
      "tokens": [
        'day_of_month',
        'day_of_week',
        'days_in_month',
      ]
    },
    "Function": {
      "autocomplete": true,
      "tokens": [
        'holt_winters',
        'hour',
        'label_join',
        'label_replace',
        'minute',
        'month',
        'predict_linear',
        'round',
        'scalar',
        'time',
        'timestamp',
        'vector',
        'year',
      ]
    }
  },
// Syntax model
  "Syntax": {
    "BinaryOperator": "ArithmeticBinaryOperator | ComparisonBinaryOperator | LogicalBinaryOperator",
    "LabelKeyStringList": "LabelKeyString (, LabelKeyString)*",
    "LabelExpr": "LabelKeyString LabelMatchingOperator ( LabelValueString | Number )",
    // Low level vector definition
    "SimpleInstantVector": "MetricName ('{' LabelExpr (',' LabelExpr)* '}')? | '{' LabelExpr (',' LabelExpr)* '}'",
    "SimpleRangeVector": "SimpleInstantVector '[' Duration ']'",
    // Aggregation definition
    "AggregationOp": "Aggregation ('(' InstantVector ')' ( AggregationVectorMatching '(' LabelKeyStringList ')' )? | ( AggregationVectorMatching '(' LabelKeyStringList ')' )? '(' InstantVector ')')",
    "AggregationOpWithParam": "AggregationWithParameter ('(' Number ',' InstantVector ')' ( AggregationVectorMatching '(' LabelKeyStringList ')' )? | ( AggregationVectorMatching '(' LabelKeyStringList ')' )? '('  Number ',' InstantVector ')')\"",
    "AggregationOverTimeOp": "AggregationOverTime '(' RangeVector ')'",
    // Function Definition
    "FunctionTakesInstantVectorReturnsInstantVectorOp": "FunctionTakesInstantVectorReturnsInstantVector '(' InstantVector ')'",
    "FunctionTakesRangeVectorReturnsInstantVectorOp": "FunctionTakesRangeVectorReturnsInstantVector '(' RangeVector ')'",
    "FunctionClampOp": "FunctionClamp '(' InstantVector ',' Scalar ')'",
    "FunctionDayOp": "FunctionDay '(' InstantVector? ')'",
    "InstantVectorFunction": "FunctionTakesInstantVectorReturnsInstantVectorOp | FunctionTakesRangeVectorReturnsInstantVectorOp | FunctionClampOp",
    // Scalar
    "Scalar": "Number | FunctionDayOp",
    // Vector definition
    "InstantVector": "(AggregationOp | AggregationOpWithParam | AggregationOverTimeOp | InstantVectorFunction | SimpleInstantVector) (ArithmeticBinaryOperator Scalar)*",
    "RangeVector": "SimpleRangeVector",
    "Vector": "RangeVector | InstantVector",
    "VectorMatchingOp": "Vector BinaryOperator ( VectorOneToOneMatching '(' LabelKeyStringList ')')?  ( VectorOneToManyMatching )? Vector",
    // Definitive PromQL Grammar
    "PromQLExpr": "Comment | VectorMatchingOp | Vector | Scalar"
  },
  "Parser": [ [ "PromQLExpr" ] ]
};
