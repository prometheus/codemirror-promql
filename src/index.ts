import { PromQLLightGrammar } from "./promql-light-grammar";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const CodeMirror = require('codemirror');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CodeMirrorGrammar = require("./codemirror_grammar.js");
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/lint/lint');

const promQLMode = CodeMirrorGrammar.getMode(PromQLLightGrammar, null, CodeMirror);

CodeMirror.defineMode('promql', promQLMode);
CodeMirror.defineMIME('text/x-promql', 'promql');

// enable user-defined code folding in the specification (new feature)
promQLMode.supportCodeFolding = true;
CodeMirror.registerHelper("fold", promQLMode.foldType, promQLMode.folder);

// enable user-defined code matching in the specification (new feature)
promQLMode.supportCodeMatching = true;
promQLMode.matcher.options = {maxHighlightLineLength: 1000}; // default
// eslint-disable-next-line @typescript-eslint/no-explicit-any
CodeMirror.defineOption("matching", false, function (cm: any, val: any, old: any): void {
  if (old && old != CodeMirror.Init) {
    cm.off("cursorActivity", promQLMode.matcher);
    promQLMode.matcher.clear(cm);
  }
  if (val) {
    cm.on("cursorActivity", promQLMode.matcher);
    promQLMode.matcher(cm);
  }
});

// enable syntax lint-like validation in the grammar
promQLMode.supportGrammarAnnotations = true;
CodeMirror.registerHelper("lint", "promql", promQLMode.validator);

// enable autocompletion
promQLMode.supportAutoCompletion = true;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
CodeMirror.commands[ 'promQLAutoCompletion' ] = function (cm: any): void {
  CodeMirror.showHint(cm, promQLMode.autocompleter, {prefixMatch: true, caseInsensitiveMatch: false});
};
