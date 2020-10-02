import { Completion, snippet } from '@codemirror/next/autocomplete';

export const matchOpTerms = [{ label: '=' }, { label: '!=' }, { label: '=~' }, { label: '!~' }];
export const binOpTerms = [
  { label: '^' },
  { label: '*' },
  { label: '/' },
  { label: '%' },
  { label: '+' },
  { label: '-' },
  { label: '==' },
  { label: '>=' },
  { label: '>' },
  { label: '<' },
  { label: '<=' },
  { label: '!=' },
  { label: 'and' },
  { label: 'or' },
  { label: 'unless' },
];
export const binOpModifierTerms = [{ label: 'on' }, { label: 'ignoring' }, { label: 'group_left' }, { label: 'group_right' }];
export const functionIdentifierTerms = [
  {
    label: 'abs',
    detail: 'function',
    info: 'Return absolute values of input series',
  },
  {
    label: 'absent',
    detail: 'function',
    info: 'Determine whether input vector is empty',
  },
  {
    label: 'absent_over_time',
    detail: 'function',
    info: 'Determine whether input range vector is empty',
  },
  {
    label: 'avg_over_time',
    detail: 'function',
    info: 'Average series values over time',
  },
  {
    label: 'ceil',
    detail: 'function',
    info: 'Round up values of input series to nearest integer',
  },
  {
    label: 'changes',
    detail: 'function',
    info: 'Return number of value changes in input series over time',
  },
  {
    label: 'clamp_max',
    detail: 'function',
    info: 'Limit the value of input series to a maximum',
  },
  {
    label: 'clamp_min',
    detail: 'function',
    info: 'Limit the value of input series to a minimum',
  },
  {
    label: 'count_over_time',
    detail: 'function',
    info: 'Count the number of values for each input series',
  },
  {
    label: 'days_in_month',
    detail: 'function',
    info: 'Return the number of days in current month for provided timestamps',
  },
  {
    label: 'day_of_month',
    detail: 'function',
    info: 'Return the day of the month for provided timestamps',
  },
  {
    label: 'day_of_week',
    detail: 'function',
    info: 'Return the day of the week for provided timestamps',
  },
  {
    label: 'delta',
    detail: 'function',
    info: 'Calculate the difference between beginning and end of a range vector (for gauges)',
  },
  {
    label: 'deriv',
    detail: 'function',
    info: 'Calculate the per-second derivative over series in a range vector (for gauges)',
  },
  {
    label: 'exp',
    detail: 'function',
    info: 'Calculate exponential function for input vector values',
  },
  {
    label: 'floor',
    detail: 'function',
    info: 'Round down values of input series to nearest integer',
  },
  {
    label: 'histogram_quantile',
    detail: 'function',
    info: 'Calculate quantiles from histogram buckets',
  },
  {
    label: 'holt_winters',
    detail: 'function',
    info: 'Calculate smoothed value of input series',
  },
  {
    label: 'hour',
    detail: 'function',
    info: 'Return the hour of the day for provided timestamps',
  },
  {
    label: 'idelta',
    detail: 'function',
    info: 'Calculate the difference between the last two samples of a range vector (for counters)',
  },
  {
    label: 'increase',
    detail: 'function',
    info: 'Calculate the increase in value over a range of time (for counters)',
  },
  {
    label: 'irate',
    detail: 'function',
    info: 'Calculate the per-second increase over the last two samples of a range vector (for counters)',
  },
  {
    label: 'label_replace',
    detail: 'function',
    info: 'Set or replace label values',
  },
  {
    label: 'label_join',
    detail: 'function',
    info: 'Join together label values into new label',
  },
  {
    label: 'ln',
    detail: 'function',
    info: 'Calculate natural logarithm of input series',
  },
  {
    label: 'log10',
    detail: 'function',
    info: 'Calulcate base-10 logarithm of input series',
  },
  {
    label: 'log2',
    detail: 'function',
    info: 'Calculate base-2 logarithm of input series',
  },
  {
    label: 'max_over_time',
    detail: 'function',
    info: 'Return the maximum value over time for input series',
  },
  {
    label: 'min_over_time',
    detail: 'function',
    info: 'Return the minimum value over time for input series',
  },
  {
    label: 'minute',
    detail: 'function',
    info: 'Return the minute of the hour for provided timestamps',
  },
  {
    label: 'month',
    detail: 'function',
    info: 'Return the month for provided timestamps',
  },
  {
    label: 'predict_linear',
    detail: 'function',
    info: 'Predict the value of a gauge into the future',
  },
  {
    label: 'quantile_over_time',
    detail: 'function',
    info: 'Calculate value quantiles over time for input series',
  },
  {
    label: 'rate',
    detail: 'function',
    info: 'Calculate per-second increase over a range vector (for counters)',
  },
  {
    label: 'resets',
    detail: 'function',
    info: 'Return number of value decreases (resets) in input series of time',
  },
  {
    label: 'round',
    detail: 'function',
    info: 'Round values of input series to nearest integer',
  },
  {
    label: 'scalar',
    detail: 'function',
    info: 'Convert single-element series vector into scalar value',
  },
  {
    label: 'sort',
    detail: 'function',
    info: 'Sort input series ascendingly by value',
  },
  {
    label: 'sort_desc',
    detail: 'function',
    info: 'Sort input series descendingly by value',
  },
  {
    label: 'sqrt',
    detail: 'function',
    info: 'Return the square root for input series',
  },
  {
    label: 'stddev_over_time',
    detail: 'function',
    info: 'Calculate the standard deviation within input series over time',
  },
  {
    label: 'stdvar_over_time',
    detail: 'function',
    info: 'Calculate the standard variation within input series over time',
  },
  {
    label: 'sum_over_time',
    detail: 'function',
    info: 'Calculate the sum over the values of input series over time',
  },
  {
    label: 'time',
    detail: 'function',
    info: 'Return the Unix timestamp at the current evaluation time',
  },
  {
    label: 'timestamp',
    detail: 'function',
    info: 'Return the Unix timestamp for the samples in the input vector',
  },
  {
    label: 'vector',
    detail: 'function',
    info: 'Convert a scalar value into a single-element series vector',
  },
  {
    label: 'year',
    detail: 'function',
    info: 'Return the year for provided timestamps',
  },
];
export const aggregateOpTerms = [
  {
    label: 'avg',
    detail: 'aggregation',
    info: 'Calculate the average over dimensions',
  },
  {
    label: 'bottomk',
    detail: 'aggregation',
    info: 'Smallest k elements by sample value',
  },
  {
    label: 'count',
    detail: 'aggregation',
    info: 'Count number of elements in the vector',
  },
  {
    label: 'count_values',
    detail: 'aggregation',
    info: 'Count number of elements with the same value',
  },
  {
    label: 'group',
    detail: 'aggregation',
    info: 'Group series, while setting the sample value to 1',
  },
  {
    label: 'max',
    detail: 'aggregation',
    info: 'Select maximum over dimensions',
  },
  {
    label: 'min',
    detail: 'aggregation',
    info: 'Select minimum over dimensions',
  },
  {
    label: 'quantile',
    detail: 'aggregation',
    info: 'Calculate φ-quantile (0 ≤ φ ≤ 1) over dimensions',
  },
  {
    label: 'stddev',
    detail: 'aggregation',
    info: 'Calculate population standard deviation over dimensions',
  },
  {
    label: 'stdvar',
    detail: 'aggregation',
    info: 'Calculate population standard variance over dimensions',
  },
  {
    label: 'sum',
    detail: 'aggregation',
    info: 'Calculate sum over dimensions',
  },
  {
    label: 'topk',
    detail: 'aggregation',
    info: 'Largest k elements by sample value',
  },
];

export const aggregateOpModifierTerms = [{ label: 'by' }, { label: 'without' }];

export const snippets: readonly Completion[] = [
  {
    label: 'sum(rate(__input_vector__[5m]))',
    type: 'function',
    detail: 'snippet',
    apply: snippet('sum(rate(${__input_vector__}[5m]))'),
  },
  {
    label: 'histogram_quantile(__quantile__, sum by(le) (rate(__histogram_metric__[5m])))',
    type: 'function',
    detail: 'snippet',
    apply: snippet('histogram_quantile(${__quantile__}, sum by(le) (rate(${__histogram_metric__}[5m])))'),
  },
  {
    label: 'label_replace(__input_vector__, "__dst__", "__replacement__", "__src__", "__regex__")',
    type: 'function',
    detail: 'snippet',
    apply: snippet('label_replace(${__input_vector__}, "${__dst__}", "${__replacement__}", "${__src__}", "${__regex__}")'),
  },
];
