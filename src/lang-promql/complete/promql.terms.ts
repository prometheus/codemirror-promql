import { AutoCompleteNode } from './hybrid';

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
export const functionIdentifierTerms: AutoCompleteNode[] = [
  {
    label: 'abs',
    info: 'Return absolute values of input series',
  },
  {
    label: 'absent',
    info: 'Determine whether input vector is empty',
  },
  {
    label: 'absent_over_time',
    info: 'Determine whether input range vector is empty',
  },
  {
    label: 'avg_over_time',
    info: 'Average series values over time',
  },
  {
    label: 'ceil',
    info: 'Round up values of input series to nearest integer',
  },
  {
    label: 'changes',
    info: 'Return number of value changes in input series over time',
  },
  {
    label: 'clamp_max',
    info: 'Limit the value of input series to a maximum',
  },
  {
    label: 'clamp_min',
    info: 'Limit the value of input series to a minimum',
  },
  {
    label: 'count_over_time',
    info: 'Count the number of values for each input series',
  },
  {
    label: 'days_in_month',
    info: 'Return the number of days in current month for provided timestamps',
  },
  {
    label: 'day_of_month',
    info: 'Return the day of the month for provided timestamps',
  },
  {
    label: 'day_of_week',
    info: 'Return the day of the week for provided timestamps',
  },
  {
    label: 'delta',
    info: 'Calculate the difference between beginning and end of a range vector (for gauges)',
  },
  {
    label: 'deriv',
    info: 'Calculate the per-second derivative over series in a range vector (for gauges)',
  },
  {
    label: 'exp',
    info: 'Calculate exponential function for input vector values',
  },
  {
    label: 'floor',
    info: 'Round down values of input series to nearest integer',
  },
  {
    label: 'histogram_quantile',
    info: 'Calculate quantiles from histogram buckets',
  },
  {
    label: 'holt_winters',
    info: 'Calculate smoothed value of input series',
  },
  {
    label: 'hour',
    info: 'Return the hour of the day for provided timestamps',
  },
  {
    label: 'idelta',
    info: 'Calculate the difference between the last two samples of a range vector (for counters)',
  },
  {
    label: 'increase',
    info: 'Calculate the increase in value over a range of time (for counters)',
  },
  {
    label: 'irate',
    info: 'Calculate the per-second increase over the last two samples of a range vector (for counters)',
  },
  {
    label: 'label_replace',
    info: 'Set or replace label values',
  },
  {
    label: 'label_join',
    info: 'Join together label values into new label',
  },
  {
    label: 'ln',
    info: 'Calculate natural logarithm of input series',
  },
  {
    label: 'log10',
    info: 'Calulcate base-10 logarithm of input series',
  },
  {
    label: 'log2',
    info: 'Calculate base-2 logarithm of input series',
  },
  {
    label: 'max_over_time',
    info: 'Return the maximum value over time for input series',
  },
  {
    label: 'min_over_time',
    info: 'Return the minimum value over time for input series',
  },
  {
    label: 'minute',
    info: 'Return the minute of the hour for provided timestamps',
  },
  {
    label: 'month',
    info: 'Return the month for provided timestamps',
  },
  {
    label: 'predict_linear',
    info: 'Predict the value of a gauge into the future',
  },
  {
    label: 'quantile_over_time',
    info: 'Calculate value quantiles over time for input series',
  },
  {
    label: 'rate',
    info: 'Calculate per-second increase over a range vector (for counters)',
  },
  {
    label: 'resets',
    info: 'Return number of value decreases (resets) in input series of time',
  },
  {
    label: 'round',
    info: 'Round values of input series to nearest integer',
  },
  {
    label: 'scalar',
    info: 'Convert single-element series vector into scalar value',
  },
  {
    label: 'sort',
    info: 'Sort input series ascendingly by value',
  },
  {
    label: 'sort_desc',
    info: 'Sort input series descendingly by value',
  },
  {
    label: 'sqrt',
    info: 'Return the square root for input series',
  },
  {
    label: 'stddev_over_time',
    info: 'Calculate the standard deviation within input series over time',
  },
  {
    label: 'stdvar_over_time',
    info: 'Calculate the standard variation within input series over time',
  },
  {
    label: 'sum_over_time',
    info: 'Calculate the sum over the values of input series over time',
  },
  {
    label: 'time',
    info: 'Return the Unix timestamp at the current evaluation time',
  },
  {
    label: 'timestamp',
    info: 'Return the Unix timestamp for the samples in the input vector',
  },
  {
    label: 'vector',
    info: 'Convert a scalar value into a single-element series vector',
  },
  {
    label: 'year',
    info: 'Return the year for provided timestamps',
  },
];
functionIdentifierTerms.forEach((term) => {
  term.detail = 'function';
});
export const aggregateOpTerms: AutoCompleteNode[] = [
  {
    label: 'avg',
    info: 'Calculate the average over dimensions',
  },
  {
    label: 'bottomk',
    info: 'Smallest k elements by sample value',
  },
  {
    label: 'count',
    info: 'Count number of elements in the vector',
  },
  {
    label: 'count_values',
    info: 'Count number of elements with the same value',
  },
  {
    label: 'group',
    info: 'All values in the resulting vector are 1',
  },
  {
    label: 'max',
    info: 'Select maximum over dimensions',
  },
  {
    label: 'min',
    info: 'Select minimum over dimensions',
  },
  {
    label: 'quantile',
    info: 'Calculate φ-quantile (0 ≤ φ ≤ 1) over dimensions',
  },
  {
    label: 'stddev',
    info: 'Calculate population standard deviation over dimensions',
  },
  {
    label: 'stdvar',
    info: 'Calculate population standard variance over dimensions',
  },
  {
    label: 'sum',
    info: 'Calculate sum over dimensions',
  },
  {
    label: 'topk',
    info: 'Largest k elements by sample value',
  },
];
aggregateOpTerms.forEach((term) => {
  term.detail = 'aggregation';
});

export const aggregateOpModifierTerms = [{ label: 'by' }, { label: 'without' }];
