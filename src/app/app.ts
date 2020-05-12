import '../mode/index'
// import the css in order to be considered by webpack
// please don't import other css here. Import the css in the file app.css instead
import './app.css';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CodeMirror = require('codemirror');

CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    theme: 'material',
    mode: 'promql',
    lint: true,
    matching: true,
    extraKeys: {'Ctrl-Space': 'promQLAutoCompletion'},
    foldGutter: true,
    gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter']
  });
