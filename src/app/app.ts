import '../mode/index'
import './app.css';
const CodeMirror = require('codemirror');

const editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    theme: 'material',
    mode: 'promql',
    lint: true,
    matching: true,
    extraKeys: {'Ctrl-Space': 'promQLAutoCompletion'},
    foldGutter: true,
    gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter']
  });
