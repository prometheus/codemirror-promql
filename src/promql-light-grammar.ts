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
    "FunctionHistogramQuantile": "keyword",
    "FunctionHoltWinters": "keyword",
    "FunctionLabelJoin": "keyword",
    "FunctionLabelReplace": "keyword",
    "FunctionPredictLinear": "keyword",
    "FunctionRound": "keyword",
    "FunctionScalar": "keyword",
    "FunctionTime": "keyword",
    "FunctionTimestamp": "keyword",
    "FunctionVector": "keyword",
    "LabelMatchingOperator": "operator",
    "ArithmeticBinaryOperator": "operator",
    "ComparisonBinaryOperator": "operator",
    "LogicalBinaryOperator": "operator",
    "BoolOperator": "operator",
    "AggregationVectorMatching": "operator",
    "VectorOneToOneMatching": "operator",
    "VectorOneToManyMatching": "operator",
  },
  "Extra"         : {
    "fold"      : "brace+parens+tags"
  },
// Lexical model
  "Lex": {
    "Comment:comment": [ "#", null ],
    "MetricName": {
      "type": "simple",
      "tokens": "RE::/[a-zA-Z_-]+/",
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
    "LabelMatchingOperator": "RE::/(=~?)|(!(=|~))/",
    "ArithmeticBinaryOperator": "RE::/(\\+)|(\\-)|(\\*)|(\\/)|(\\%)|(\\^)/",
    "ComparisonBinaryOperator": "RE::/((=|!)=)|(>=?)|(<=?)/",
    "LogicalBinaryOperator": {
      "autocomplete": true,
      "tokens": [
        "and",
        "or",
        "unless"
      ]
    },
    "VectorOneToOneMatching": {
      "autocomplete": true,
      "tokens": [
        "on",
        "ignoring"
      ]
    },
    "VectorOneToManyMatching": {
      "autocomplete": true,
      "tokens": [
        "group_right",
        "group_left"
      ]
    },
    "AggregationVectorMatching": {
      "autocomplete": true,
      "tokens": [
        "by",
        "without"
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
        'hour',
        'minute',
        'month',
        'year',
      ]
    },
    "FunctionHistogramQuantile": {
      "autocomplete": true,
      "tokens": [
        'histogram_quantile'
      ],
      "combine": '',
    },
    "FunctionHoltWinters": {
      "autocomplete": true,
      "tokens": [
        'holt_winters'
      ],
      // Because there is only one token, we have to deactivate the default delimiter which is "\\b" (word-boundary)
      // If we don't do that, it will match 'holt_winters(' and not just 'holt_winters'
      "combine": '',
    },
    "FunctionLabelJoin": {
      "autocomplete": true,
      "tokens": [
        'label_join',
      ],
      "combine": '',
    },
    "FunctionLabelReplace": {
      "autocomplete": true,
      "tokens": [
        'label_replace',
      ],
      "combine": '',
    },
    "FunctionPredictLinear": {
      "autocomplete": true,
      'tokens': [
        'predict_linear',
      ],
      "combine": '',
    },
    "FunctionRound": {
      "autocomplete": true,
      "tokens": [
        'round'
      ],
      "combine": ''
    },
    "FunctionScalar": {
      "autocomplete": true,
      "tokens": [
        "scalar"
      ],
      "combine": ''
    },
    "FunctionTime": {
      "autocomplete": true,
      "tokens": [
        "time"
      ],
      "combine": ''
    },
    "FunctionTimestamp": {
      "autocomplete": true,
      "tokens": [
        "timestamp"
      ],
      "combine": ''
    },
    "FunctionVector": {
      "autocomplete": true,
      "tokens": [
        "vector"
      ],
      "combine": ''
    },
    "BoolOperator": {
      "autocomplete": true,
      "tokens": [
        "bool"
      ],
      "combine": ''
    }
  },
// Syntax model
  "Syntax": {
    "LabelKeyStringList": "LabelKeyString (, LabelKeyString)*",
    "LabelExpr": "LabelKeyString LabelMatchingOperator ( LabelValueString | Number )",
    // Low level vector definition
    "SimpleInstantVector": "MetricName ('{' (LabelExpr (',' LabelExpr)*)? '}')? | '{' LabelExpr (',' LabelExpr)* '}'",
    "RangeVector": "SimpleInstantVector '[' Duration ']'",
    // Aggregation definition
    "AggregationOp": "Aggregation ('(' InstantVector ')' ( AggregationVectorMatching '(' LabelKeyStringList ')' )? | ( AggregationVectorMatching '(' LabelKeyStringList ')' )? '(' InstantVector ')')",
    "AggregationOpWithParam": "AggregationWithParameter ('(' Number ',' InstantVector ')' ( AggregationVectorMatching '(' LabelKeyStringList ')' )? | ( AggregationVectorMatching '(' LabelKeyStringList ')' )? '('  Number ',' InstantVector ')')",
    "AggregationOverTimeOp": "AggregationOverTime '(' RangeVector ')'",
    // Function Definition for instant vector
    "FunctionTakesInstantVectorReturnsInstantVectorOp": "FunctionTakesInstantVectorReturnsInstantVector '(' InstantVector ')'",
    "FunctionTakesRangeVectorReturnsInstantVectorOp": "FunctionTakesRangeVectorReturnsInstantVector '(' RangeVector ')'",
    "FunctionClampOp": "FunctionClamp '(' InstantVector ',' Scalar ')'",
    "FunctionHistogramQuantileOp": "FunctionHistogramQuantile '(' Scalar ',' InstantVector ')'",
    "FunctionHoltWintersOp": "FunctionHoltWinters '(' RangeVector ',' Scalar ',' Scalar ')'",
    "FunctionLabelJoinOp": "FunctionLabelJoin '(' InstantVector ',' LabelValueString (',' LabelValueString)+ ')'",
    "FunctionLabelReplaceOp": "FunctionLabelReplace '(' InstantVector ',' LabelValueString ',' LabelValueString ',' LabelValueString ',' LabelValueString ')'",
    "FunctionPredictLinearOp": "FunctionPredictLinear '(' RangeVector ',' Scalar ')'",
    "FunctionRoundOp": "FunctionRound '(' InstantVector (',' Scalar)? ')'",
    "FunctionVectorOp": "FunctionVector '(' Scalar ')'",
    "InstantVectorFunction": "FunctionTakesInstantVectorReturnsInstantVectorOp | FunctionTakesRangeVectorReturnsInstantVectorOp | FunctionClampOp | FunctionHistogramQuantileOp | FunctionHoltWintersOp | FunctionPredictLinearOp | FunctionLabelJoinOp | FunctionLabelReplaceOp | FunctionRoundOp | FunctionVectorOp",

    // Scalar definition
    "FunctionDayOp": "FunctionDay '(' InstantVector? ')'",
    "FunctionScalarOp": "FunctionScalar '(' InstantVector ')'",
    "FunctionTimeOp": "FunctionTime '()'",
    "FunctionTimestampOp": "FunctionTimestamp '(' InstantVector ')'",
    // Note: don't change the order, FunctionTimestampOp must be evaluated before FunctionTimeOp
    "Scalar": "Number | FunctionDayOp | FunctionScalarOp | FunctionTimestampOp | FunctionTimeOp",
    // Vector definition
    "InstantVector": "AggregationOp | AggregationOpWithParam | AggregationOverTimeOp | InstantVectorFunction | (SimpleInstantVector ('[' Duration ']')?)",
    // Expression definition
    "BinOp": "( Scalar | InstantVector ) ((ArithmeticBinaryOperator | ComparisonBinaryOperator BoolOperator? | LogicalBinaryOperator ) ( VectorOneToOneMatching '(' LabelKeyStringList ')')?  VectorOneToManyMatching? Expr)?",
    // Definitive PromQL Grammar
    "Expr": "'(' Expr ')' | BinOp",
    "PromQLExpr": "Comment | Expr"
  },
  "Parser": [ [ "PromQLExpr" ] ]
};
