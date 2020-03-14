import { StringStream } from "codemirror";

export interface PromQLState {
  tokenize: { (stream: StringStream, state: PromQLState): null | string }[];
}

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

// PromQL Operators
// (https://prometheus.io/docs/prometheus/latest/querying/operators/)
const operators = [
  '+', '-', '*', '/', '%', '^',
  '==', '!=', '>', '<', '>=', '<=',
  'and', 'or', 'unless',
];
const isShortOperator = /[+\-*^%:=<>!\/~]/;
// PromQL offset modifier
// (https://prometheus.io/docs/prometheus/latest/querying/basics/#offset-modifier)
const offsetModifier = [
  'offset',
];

const atoms = [
  "true",
  "false",
];

// we include these common regular expressions
const integerSuffix = /(ll|LL|u|U|l|L)?(ll|LL|u|U|l|L)?/;
const floatSuffix = /[fFlL]?/;

const delimiter = /[{}()\[\]]/;
const word = /[\w$_\-\xa1-\uffff]/;

const aggregationOrFunction = aggregations.concat(functions).concat(aggregationsOverTime);

// startReadToken handle the space and comment usage that is possible to have at each time
function startReadToken(stream: StringStream): null | string {
  stream.eatSpace();
  if (stream.peek() === '#') {
    stream.skipToEnd();
    return 'comment'
  }
  return null
}

function readString(stream: StringStream): void {
  let next = null;
  let previous = null;
  while ((next = stream.next()) != null) {
    if (/['"`]/.test(next) && previous !== '\\') {
      return
    }
    previous = next
  }
}

function readNumber(currentChar: string, stream: StringStream): void {
  const integerRegex = /\d*[\d']*\d*/;
  const floatRegex = /\d*\.?\d+([eE][\-+]?\d+)?/;
  const hexRegex = /[xX][0-9a-fA-F']*[0-9a-fA-F]/;
  const octalRegex = /[0-7']*[0-7]/;
  const binaryRegex = /[bB][0-1']*[0-1]/;
  // 24h, 5m are often encountered in prometheus
  if (stream.match(/\d*[smhdwy]/)) {
    return;
  }
  if (stream.match(new RegExp(floatRegex.source + "(" + floatSuffix.source + ")"))) {
    return;
  }

  if (stream.match(new RegExp(integerRegex.source + "(" + integerSuffix.source + ")"))) {
    return;
  }

  if (currentChar === '0') {
    if (stream.match(new RegExp(hexRegex.source + "(" + integerSuffix.source + ")"))) { // hex
      return;
    }
    if (stream.match(new RegExp(octalRegex.source + "(" + integerSuffix.source + ")"))) { // octal
      return;
    }
    stream.match(new RegExp(binaryRegex.source + "(" + integerSuffix.source + ")")) // binary
  }
}

function readVectorMatchingVariable(stream: StringStream, state: PromQLState): null | string {
  const style = startReadToken(stream);
  if (style) {
    return style;
  }
  const nextChar = stream.peek();
  if (nextChar === ',') {
    // it's the label separator, do nothing excepting consuming the next char
    stream.next();
    return null
  }
  if (nextChar && delimiter.test(nextChar)) {
    if (nextChar === ')') {
      // that's the end of the vectorMatching declaration. Stop using the current function
      // don't consume the nextChar because it will be used by the method readVectorMatchingVariable to also remove it in the stack
      state.tokenize.pop();
    } else {
      // otherwise the expression is not correct, so just leave the method, because the method readVectorMatching will return an error
      state.tokenize.pop();
      return null
    }
  }

  // now move the cursor to the next word and declare it's a variable
  stream.eatWhile(word);
  return "variable"
}

function readVectorMatching(stream: StringStream, state: PromQLState): null | string {
  const style = startReadToken(stream);
  if (style) {
    return style;
  }

  const ch = stream.next();
  // normally the character must be a delimiter. If it's not the case, then it's an error
  if (ch && delimiter.test(ch)) {
    if (ch === '(') {
      // that's the start of the different label used for the matching vector
      // now use the function relative to the vectorMatching variable
      state.tokenize.push(readVectorMatchingVariable);
      return null
    }
    // end of the vector matching reading
    if (ch === ')') {
      state.tokenize.pop();
      return null
    }
  }

  // for all other case, that's an error and it's not anymore useful to stay in this function
  state.tokenize.pop();
  return "keyword error";
}

function readLabel(stream: StringStream, state: PromQLState): null | string {
  const style = startReadToken(stream);
  if (style) {
    return style;
  }
  const ch = stream.next();
  if (!ch) {
    return null
  }

  if (delimiter.test(ch)) {
    if (ch === '}') {
      // that's the end of the label declaration. Stop using the current function and go back to parent function
      state.tokenize.pop();
      return null
    }
    // in other case that's an error
    state.tokenize.pop();
    return 'error'
  }

  if (ch === ',') {
    // it's the label separator, do nothing
    return null
  }
  // check if it's the beginning of a string
  if (/['"`]/.test(ch)) {
    readString(stream);
    return 'string'
  }
  // check if it's a short operator
  if (isShortOperator.test(ch)) {
    stream.eatWhile(isShortOperator);
    return "operator";
  }
  // check if it's the beginning of a number
  if (/\d/.test(ch)) {
    readNumber(ch, stream);
    return 'number'
  }

  if (word.test(ch)) {
    // now move the cursor to the next word
    stream.eatWhile(word);
    return 'variable'
  }
  state.tokenize.pop();
  return 'error'
}

function readNumberInMetric(stream: StringStream, state: PromQLState): null | string {
  stream.eatSpace();
  if (stream.match(/\d+[smhdwy]/)) {
    return 'number'
  }
  const nextChar = stream.next();
  if (!nextChar) {
    return null
  }
  if (nextChar === ']') {
    state.tokenize.pop();
    return null
  }
  state.tokenize.pop();
  return 'error'
}

function readMetric(stream: StringStream, state: PromQLState): null | string {
  const style = startReadToken(stream);
  if (style) {
    return style;
  }
  const nextChar = stream.peek();
  if (!nextChar) {
    return null
  }
  if (delimiter.test(nextChar)) {
    if (nextChar === '{') {
      stream.next();
      state.tokenize.push(readLabel);
      return null
    }
    if (nextChar === '[') {
      stream.next();
      state.tokenize.push(readNumberInMetric);
      return null
    }
    // in other case it can be the end of a function declaration
    // since we cannot decide if it's an error or not, we let the parent function to decide
    state.tokenize.pop();
    return null
  }
  state.tokenize.pop();
  return 'error'
}

function readAggregationOrFunction(stream: StringStream, state: PromQLState): null | string {
  const style = startReadToken(stream);
  if (style) {
    return style;
  }
  const nextChar = stream.peek();
  if (!nextChar) {
    // eol
    stream.next();
    return null
  }
  // check if next char will be a delimiter or a char that could be a start of vectorMatching keyword
  if (delimiter.test(nextChar)) {
    if (nextChar === '{') {
      state.tokenize.push(readMetric);
      return null
    }
    // for all other case eat the delimiter
    stream.next();
    if (nextChar === '(') {
      // can be a metric or another function/aggregation or space or a comment
      // so simply start again the function
      return null
    }
    if (nextChar === ')') {
      state.tokenize.pop();
      return null
    }
  } else if (word.test(nextChar)) {
    stream.eatWhile(word);
    const currentWord = stream.current();
    if (vectorMatching.indexOf(currentWord) > -1) {
      state.tokenize.push(readVectorMatching);
      return "keyword"
    }
    if (aggregationOrFunction.indexOf(currentWord) > -1) {
      return "keyword"
    }
    // in other case, that's the metric name
    state.tokenize.push(readMetric);
    return null
  }
  state.tokenize.pop();
  return 'keyword error'
}

export function tokenBase(stream: StringStream, state: PromQLState): null | string {
  const style = startReadToken(stream);
  if (style) {
    return style;
  }
  // get the next char and consume it, so in any case, the stream won't be stuck in an infinite loop
  const ch = stream.next();
  if (!ch) {
    return null;
  }
  // analyze the current character
  // check if it's the beginning of a string
  if (/['"`]/.test(ch)) {
    readString(stream);
    return 'string'
  }
  // check if it's the beginning of a number
  if (/\d/.test(ch)) {
    readNumber(ch, stream);
    return 'number'
  }
  // check if it's a short operator
  if (isShortOperator.test(ch)) {
    stream.eatWhile(isShortOperator);
    return "operator";
  }
  // check if it's a delimiter
  if (delimiter.test(ch)) {
    return null
  }
  // now move the cursor to the next word and check if it's a known word
  stream.eatWhile(word);
  const cur = stream.current();

  // since a vectorMatching is necessary associated to a function/aggregation, if there is match here, that's an error
  if (vectorMatching.indexOf(cur) > -1) {
    return "keyword error"
  }

  if (aggregationOrFunction.indexOf(cur) > -1) {
    // aggregation or function are treated separately in order to be able to detect if there is a syntax error
    state.tokenize.push(readAggregationOrFunction);
    return "keyword";
  }

  if (offsetModifier.indexOf(cur) > -1) {
    return "keyword";
  }

  if (operators.indexOf(cur) > -1) {
    return 'operator';
  }

  if (atoms.indexOf(cur) > -1) {
    return 'atom';
  }

  state.tokenize.push(readMetric);

  return null
}
