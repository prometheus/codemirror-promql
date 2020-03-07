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
const isShortOperator = /[+\-*^%:=<>!\/]/;
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

// Merging all the keywords in one list
const keywords = aggregations.concat(functions).concat(aggregationsOverTime).concat(vectorMatching).concat(offsetModifier);

function readBlockComment(stream: StringStream): string {
  stream.skipToEnd();
  return 'comment'
}

function readString(stream: StringStream): void {
  let next = null;
  let previous = null;
  while ((next = stream.next()) != null) {
    if ((next === '\'' || next === '"') && previous !== '\\') {
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
  // first eat all space
  stream.eatSpace();
  const nextChar = stream.peek();
  if (nextChar === ',') {
    // it's the label separator, do nothing excepting consuming the next char
    stream.next();
    return null
  }
  if (nextChar === ')') {
    // that's the end of the vectorMatching declaration. Stop using the current function
    // don't consume the nextChar because it will be used by the method readVectorMatchingVariable to also remove it in the stack
    state.tokenize.pop()
  }
  // now move the cursor to the next word and declare it's a variable
  stream.eatWhile(/[\w$_-]/);
  return "variable"
}

function readVectorMatching(stream: StringStream, state: PromQLState): null {
  // first eat all space
  stream.eatSpace();
  // check if we have an open bracket, if we don't, just leave because it's or a wrong syntax or we are at the end of the matchingVector declaration
  const ch = stream.next();
  if (ch !== '(') {
    state.tokenize.pop();
    return null
  }
  // now use the function relative to the vectorMatching variable
  state.tokenize.push(readVectorMatchingVariable);
  return null
}

function readLabel(stream: StringStream, state: PromQLState): null | string {
  // first eat all space
  stream.eatSpace();
  const ch = stream.next();
  if (!ch) {
    return null
  }
  if (ch === '}') {
    // that's the end of the label declaration. Stop using the current function and go back to tokenBase function
    state.tokenize.pop();
    return null
  }
  if (ch === ',') {
    // it's the label separator, do nothing
    return null
  }
  // check if it's the beginning of a string
  if (ch === '\'' || ch === '"') {
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
  // now move the cursor to the next word and check if it's a known word
  stream.eatWhile(/[\w$_-]/);
  return 'variable'
}

export function tokenBase(stream: StringStream, state: PromQLState): null | string {
  if (stream.peek() === '#') {
    return readBlockComment(stream)
  }

  if (stream.eatSpace()) {
    return null
  }
  // get the next char and consume it, so in any case, the stream won't be stuck in an infinite loop
  const ch = stream.next();
  if (!ch) {
    return null;
  }
  // analyze the current character
  // check if it's the beginning of a string
  if (ch === '\'' || ch === '"') {
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
  // if it's a delimiter, just ignore it
  if (/[{}()\[\]]/.test(ch)) {
    return null
  }
  // now move the cursor to the next word and check if it's a known word
  stream.eatWhile(/[\w$_-]/);
  const cur = stream.current();

  // in case it's a vectorMatching keyword, we should use a different function to treat item between the bracket
  if (vectorMatching.indexOf(cur) > -1) {
    state.tokenize.push(readVectorMatching);
    return "keyword"
  }

  if (keywords.indexOf(cur) > -1) {
    return "keyword";
  }

  if (operators.indexOf(cur) > -1) {
    return 'operator';
  }

  if (atoms.indexOf(cur) > -1) {
    return 'atom';
  }

  // label special case
  const nextChar = stream.peek();
  if (nextChar === '{') {
    // in that case properly parse key=value labels
    stream.next();
    state.tokenize.push(readLabel);
    return null;
  }

  return null
}
