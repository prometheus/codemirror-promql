// The MIT License (MIT)
//
// Copyright (c) 2020 The Prometheus Authors
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { EditorState, EditorView } from '@codemirror/next/basic-setup';
import { promQL, setComplete } from '../lang-promql';
import { Extension } from '@codemirror/next/state';
import { history, historyKeymap } from '@codemirror/next/history';
import { highlightSpecialChars, keymap, multipleSelections } from '@codemirror/next/view';
import { lineNumbers } from '@codemirror/next/gutter';
import { foldGutter, foldKeymap } from '@codemirror/next/fold';
import { defaultHighlighter } from '@codemirror/next/highlight';
import { bracketMatching } from '@codemirror/next/matchbrackets';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/next/closebrackets';
import { autocomplete, autocompleteKeymap, FilterType } from '@nexucis/codemirror-next-autocomplete';
import { rectangularSelection } from '@codemirror/next/rectangular-selection';
import { highlightActiveLine, highlightSelectionMatches } from '@codemirror/next/highlight-selection';
import { defaultKeymap } from '@codemirror/next/commands';
import { searchKeymap } from '@codemirror/next/search';
import { commentKeymap } from '@codemirror/next/comment';
import { gotoLineKeymap } from '@codemirror/next/goto-line';
import { lintKeymap } from '@codemirror/next/lint';

export const basicSetup: Extension = [
  lineNumbers(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  multipleSelections(),
  defaultHighlighter,
  bracketMatching(),
  closeBrackets(),
  autocomplete({ filterType: FilterType.Fuzzy }),
  rectangularSelection(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...commentKeymap,
    ...gotoLineKeymap,
    ...autocompleteKeymap,
    ...lintKeymap,
  ]),
];

function activateLSPAutocompletion(): void {
  setComplete({
    url: 'http://localhost:8080',
    enableLSP: true,
    offline: false,
  });
}

function activatePrometheusAutocompletion(): void {
  setComplete({
    url: 'http://localhost:9090',
    enableLSP: false,
    offline: false,
  });
}

function activateOfflineAutocompletion(): void {
  setComplete({ url: '', enableLSP: false, offline: true });
}

new EditorView({
  state: EditorState.create({ extensions: [basicSetup, promQL()] }),
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  parent: document.querySelector('#editor')!,
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion,@typescript-eslint/ban-ts-ignore
// @ts-ignore
document.getElementById('lsp').addEventListener('click', function () {
  activateLSPAutocompletion();
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion,@typescript-eslint/ban-ts-ignore
// @ts-ignore
document.getElementById('offline').addEventListener('click', function () {
  activateOfflineAutocompletion();
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion,@typescript-eslint/ban-ts-ignore
// @ts-ignore
document.getElementById('prometheus').addEventListener('click', function () {
  activatePrometheusAutocompletion();
});
