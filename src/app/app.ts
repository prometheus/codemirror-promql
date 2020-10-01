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

import { basicSetup, EditorState, EditorView } from '@codemirror/next/basic-setup';
import { PromQLExtension } from '../lang-promql';
import { promQLHighlightMaterialTheme } from './theme';

const promqlExtension = new PromQLExtension();
let editor: EditorView;

function setCompletion() {
  const completionSelect = document.getElementById('completion') as HTMLSelectElement;
  const completionValue = completionSelect.options[completionSelect.selectedIndex].value;
  switch (completionValue) {
    case 'offline':
      promqlExtension.setComplete();
      break;
    case 'lsp':
      promqlExtension.setComplete({
        lsp: {
          url: 'http://localhost:8080/lsp',
        },
      });
      break;
    case 'prometheus':
      promqlExtension.setComplete({
        hybrid: {
          url: 'http://localhost:9090',
        },
      });
      break;
    default:
      promqlExtension.setComplete();
  }
}

function setLinter() {
  const completionSelect = document.getElementById('linter') as HTMLSelectElement;
  const completionValue = completionSelect.options[completionSelect.selectedIndex].value;
  switch (completionValue) {
    case 'offline':
      promqlExtension.setLinter();
      break;
    case 'lsp':
      promqlExtension.setLinter({
        lsp: {
          url: 'http://localhost:8080/lsp',
        },
      });
      break;
    default:
      promqlExtension.setLinter();
  }
}

function createEditor() {
  let doc = '';
  if (editor) {
    // When the linter is changed, it required to reload completely the editor.
    // So the first thing to do, is to completely delete the previous editor and to recreate it from scratch
    // We should preserve the current text entered as well.
    doc = editor.state.sliceDoc(0, editor.state.doc.length);
    editor.destroy();
  }
  editor = new EditorView({
    state: EditorState.create({
      extensions: [basicSetup, promqlExtension.asExtension(), promQLHighlightMaterialTheme],
      doc: doc,
    }),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    parent: document.querySelector('#editor')!,
  });
}

function applyConfiguration(): void {
  setCompletion();
  setLinter();
  createEditor();
}

createEditor();

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion,@typescript-eslint/ban-ts-ignore
// @ts-ignore
document.getElementById('apply').addEventListener('click', function () {
  applyConfiguration();
});
