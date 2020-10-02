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
    info: 'Returns the input vector with all sample values converted to their absolute value.',
  },
  {
    label: 'absent',
    info:
      'Returns an empty vector if the vector passed to it has any elements and a 1-element vector with the value 1 if the vector passed to it has no elements. This is useful for alerting on when no time series exist for a given metric name and label combination.',
  },
  {
    label: 'absent_over_time',
  },
  {
    label: 'avg_over_time',
    info: 'The average value of all points in the specified interval.',
  },
  {
    label: 'ceil',
    info: 'Rounds the sample values of all elements in `v` up to the nearest integer.',
  },
  {
    label: 'changes',
    info:
      'For each input time series, `changes(v range-vector)` returns the number of times its value has changed within the provided time range as an instant vector.',
  },
  {
    label: 'clamp_max',
    info: 'Clamps the sample values of all elements in `v` to have an upper limit of `max`.',
  },
  {
    label: 'clamp_min',
    info: 'Clamps the sample values of all elements in `v` to have a lower limit of `min`.',
  },
  {
    label: 'count_over_time',
    info: 'The count of all values in the specified interval.',
  },
  {
    label: 'days_in_month',
    info: 'Returns number of days in the month for each of the given times in UTC. Returned values are from 28 to 31.',
  },
  {
    label: 'day_of_month',
    info: 'Returns the day of the month for each of the given times in UTC. Returned values are from 1 to 31.',
  },
  {
    label: 'day_of_week',
    info: 'Returns the day of the week for each of the given times in UTC. Returned values are from 0 to 6, where 0 means Sunday etc.',
  },
  {
    label: 'delta',
    info:
      'Calculates the difference between the first and last value of each time series element in a range vector `v`, returning an instant vector with the given deltas and equivalent labels. The delta is extrapolated to cover the full time range as specified in the range vector selector, so that it is possible to get a non-integer result even if the sample values are all integers.',
  },
  {
    label: 'deriv',
    info: 'Calculates the per-second derivative of the time series in a range vector `v`, using simple linear regression.',
  },
  {
    label: 'exp',
    info: 'Calculates the exponential function for all elements in `v`.\nSpecial cases are:\n* `Exp(+Inf) = +Inf` \n* `Exp(NaN) = NaN`',
  },
  {
    label: 'floor',
    info: 'Rounds the sample values of all elements in `v` down to the nearest integer.',
  },
  {
    label: 'histogram_quantile',
    info:
      'Calculates the φ-quantile (0 ≤ φ ≤ 1) from the buckets `b` of a histogram. The samples in `b` are the counts of observations in each bucket. Each sample must have a label `le` where the label value denotes the inclusive upper bound of the bucket. (Samples without such a label are silently ignored.) The histogram metric type automatically provides time series with the `_bucket` suffix and the appropriate labels.',
  },
  {
    label: 'holt_winters',
    info:
      'Produces a smoothed value for time series based on the range in `v`. The lower the smoothing factor `sf`, the more importance is given to old data. The higher the trend factor `tf`, the more trends in the data is considered. Both `sf` and `tf` must be between 0 and 1.',
  },
  {
    label: 'hour',
    info: 'Returns the hour of the day for each of the given times in UTC. Returned values are from 0 to 23.',
  },
  {
    label: 'idelta',
    info:
      'Calculates the difference between the last two samples in the range vector `v`, returning an instant vector with the given deltas and equivalent labels.',
  },
  {
    label: 'increase',
    info:
      'Calculates the increase in the time series in the range vector. Breaks in monotonicity (such as counter resets due to target restarts) are automatically adjusted for. The increase is extrapolated to cover the full time range as specified in the range vector selector, so that it is possible to get a non-integer result even if a counter increases only by integer increments.',
  },
  {
    label: 'irate',
    info:
      'Calculates the per-second instant rate of increase of the time series in the range vector. This is based on the last two data points. Breaks in monotonicity (such as counter resets due to target restarts) are automatically adjusted for.',
  },
  {
    label: 'label_replace',
    info:
      "For each timeseries in `v`, `label_replace(v instant-vector, dst_label string, replacement string, src_label string, regex string)`  matches the regular expression `regex` against the label `src_label`.  If it matches, then the timeseries is returned with the label `dst_label` replaced by the expansion of `replacement`. `$1` is replaced with the first matching subgroup, `$2` with the second etc. If the regular expression doesn't match then the timeseries is returned unchanged.",
  },
  {
    label: 'label_join',
  },
  {
    label: 'ln',
    info:
      'calculates the natural logarithm for all elements in `v`.\nSpecial cases are:\n * `ln(+Inf) = +Inf`\n * `ln(0) = -Inf`\n * `ln(x < 0) = NaN`\n * `ln(NaN) = NaN`',
  },
  {
    label: 'log10',
    info: 'Calculates the decimal logarithm for all elements in `v`. The special cases are equivalent to those in `ln`.',
  },
  {
    label: 'log2',
    info: 'Calculates the binary logarithm for all elements in `v`. The special cases are equivalent to those in `ln`.',
  },
  {
    label: 'max_over_time',
    info: 'The maximum value of all points in the specified interval.',
  },
  {
    label: 'min_over_time',
    info: 'The minimum value of all points in the specified interval.',
  },
  {
    label: 'minute',
    info: 'Returns the minute of the hour for each of the given times in UTC. Returned values are from 0 to 59.',
  },
  {
    label: 'month',
    info: 'Returns the month of the year for each of the given times in UTC. Returned values are from 1 to 12, where 1 means January etc.',
  },
  {
    label: 'predict_linear',
    info: 'Predicts the value of time series `t` seconds from now, based on the range vector `v`, using simple linear regression.',
  },
  {
    label: 'quantile_over_time',
    info: 'The φ-quantile (0 ≤ φ ≤ 1) of the values in the specified interval.',
  },
  {
    label: 'rate',
    info:
      "Calculates the per-second average rate of increase of the time series in the range vector. Breaks in monotonicity (such as counter resets due to target restarts) are automatically adjusted for. Also, the calculation extrapolates to the ends of the time range, allowing for missed scrapes or imperfect alignment of scrape cycles with the range's time period.",
  },
  {
    label: 'resets',
    info:
      'For each input time series, `resets(v range-vector)` returns the number of counter resets within the provided time range as an instant vector. Any decrease in the value between two consecutive samples is interpreted as a counter reset.',
  },
  {
    label: 'round',
    info:
      'Rounds the sample values of all elements in `v` to the nearest integer. Ties are resolved by rounding up. The optional `to_nearest` argument allows specifying the nearest multiple to which the sample values should be rounded. This multiple may also be a fraction.',
  },
  {
    label: 'scalar',
    info:
      'Given a single-element input vector, `scalar(v instant-vector)` returns the sample value of that single element as a scalar. If the input vector does not have exactly one element, `scalar` will return `NaN`.',
  },
  {
    label: 'sort',
    info: 'Returns vector elements sorted by their sample values, in ascending order.',
  },
  {
    label: 'sort_desc',
    info: 'Returns vector elements sorted by their sample values, in descending order.',
  },
  {
    label: 'sqrt',
    info: 'Calculates the square root of all elements in `v`.',
  },
  {
    label: 'stddev_over_time',
    info: 'The population standard deviation of the values in the specified interval.',
  },
  {
    label: 'stdvar_over_time',
    info: 'The population standard variance of the values in the specified interval.',
  },
  {
    label: 'sum_over_time',
    info: 'The sum of all values in the specified interval.',
  },
  {
    label: 'time',
    info:
      'Returns the number of seconds since January 1, 1970 UTC. Note that this does not actually return the current time, but the time at which the expression is to be evaluated.',
  },
  {
    label: 'timestamp',
  },
  {
    label: 'vector',
    info: 'Returns the scalar `s` as a vector with no labels.',
  },
  {
    label: 'year',
    info: 'Returns the year for each of the given times in UTC.',
  },
];
export const aggregateOpTerms = [
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
export const aggregateOpModifierTerms = [{ label: 'by' }, { label: 'without' }];
