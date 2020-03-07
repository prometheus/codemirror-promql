// PromQL Aggregation Operators
// (https://prometheus.io/docs/prometheus/latest/querying/operators/#aggregation-operators)
const aggregations = [
  'sum',
  'min',
  'max',
  'avg',
  'stddev',
  'stdvar',
  'count',
  'count_values',
  'bottomk',
  'topk',
  'quantile',
];

// PromQL functions
// (https://prometheus.io/docs/prometheus/latest/querying/functions/)
const functions = [
  'abs',
  'absent',
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
];

// PromQL specific functions: Aggregations over time
// (https://prometheus.io/docs/prometheus/latest/querying/functions/#aggregation_over_time)
const aggregationsOverTime = [];
for (const agg of aggregations) {
  aggregationsOverTime.push(agg + '_over_time');
}

// PromQL vector matching + the by and without clauses
// (https://prometheus.io/docs/prometheus/latest/querying/operators/#vector-matching)
const vectorMatching = [
  'on',
  'ignoring',
  'group_right',
  'group_left',
  'by',
  'without',
];
// Produce a regex matching elements : (elt1|elt2|...)
const vectorMatchingRegex = `(${vectorMatching.reduce((prev, curr) => `${prev}|${curr}`)})`;

// PromQL Operators
// (https://prometheus.io/docs/prometheus/latest/querying/operators/)
const operators = [
  '+', '-', '*', '/', '%', '^',
  '==', '!=', '>', '<', '>=', '<=',
  'and', 'or', 'unless',
];

// PromQL offset modifier
// (https://prometheus.io/docs/prometheus/latest/querying/basics/#offset-modifier)
const offsetModifier = [
  'offset',
];

// Merging all the keywords in one list
const keywords = aggregations.concat(functions).concat(aggregationsOverTime).concat(vectorMatching).concat(offsetModifier);
