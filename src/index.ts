import { PromQLLightGrammar } from "./promql-light-grammar";

const CodeMirror = require('codemirror');
const CodeMirrorGrammar = require("codemirror_grammar").CodeMirrorGrammar;

const promQLMode = CodeMirrorGrammar.getMode(PromQLLightGrammar);

CodeMirror.defineMode('promql', promQLMode);
CodeMirror.defineMIME('text/x-promql', 'promql');
