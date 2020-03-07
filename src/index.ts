import * as CodeMirror from 'codemirror';

CodeMirror.defineMode('promql', function (config): CodeMirror.Mode<any> {
  return {
    name: 'promql',
    lineComment: '#'
  } as CodeMirror.Mode<any>
});

CodeMirror.defineMIME('text/x-promql', 'promql');
