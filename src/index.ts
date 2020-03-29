import { PromQLLightGrammar } from "./promql-light-grammar";

const CodeMirror = require('codemirror');
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
promQLMode.matcher.options = {maxHighlightLineLength:1000}; // default
CodeMirror.defineOption("matching", false, function( cm, val, old ) {
  if ( old && old != CodeMirror.Init )
  {
    cm.off( "cursorActivity", promQLMode.matcher );
    promQLMode.matcher.clear( cm );
  }
  if ( val )
  {
    cm.on( "cursorActivity", promQLMode.matcher );
    promQLMode.matcher( cm );
  }
});

// enable syntax lint-like validation in the grammar
promQLMode.supportGrammarAnnotations = true;
CodeMirror.registerHelper("lint", "promql", promQLMode.validator);

// enable autocompletion
promQLMode.supportAutoCompletion = true;
CodeMirror.commands[ 'promQLAutoCompletion' ] = function (cm) {
  CodeMirror.showHint(cm, promQLMode.autocompleter, {prefixMatch: true, caseInsensitiveMatch: false});
};
