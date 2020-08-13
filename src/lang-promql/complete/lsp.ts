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

import { AutocompleteContext, Completion, CompletionResult } from '@nexucis/codemirror-next-autocomplete';
import { CompletionItem, TextEdit } from 'vscode-languageserver-types';
import { CompleteStrategy } from './index';
import { LSPBody, LSPClient } from '../client';

// LSPComplete will provide an autocompletion based on what the langserver-promql is providing when requested.
export class LSPComplete implements CompleteStrategy {
  private readonly lspClient: LSPClient;

  constructor(lspClient: LSPClient) {
    this.lspClient = lspClient;
  }

  promQL(context: AutocompleteContext): Promise<CompletionResult> {
    const { state, pos } = context;
    const line = state.doc.lineAt(pos);
    const body: LSPBody = {
      expr: state.doc.sliceString(0),
      limit: 100,
      // positionChar starts at 0 at the beginning of the line for LSP.
      positionChar: pos - line.from - 1 > 0 ? pos - line.from - 1 : pos - line.from,
      // positionLine starts at 0 from LSP and at 1 from CMN.
      positionLine: line.number - 1,
    };
    return this.lspClient.complete(body).then((items: CompletionItem[]) => {
      const options: Completion[] = [];
      // For every `textEdit` present, they all have exactly the same `range.start` value.
      // so the goal is to save the last one present in order to use it later to calculate the position `from`.
      // Note: textEdit can be undefined but that's just because otherwise it doesn't compile.
      // See more here: https://github.com/microsoft/TypeScript/issues/12916
      // and here https://github.com/microsoft/TypeScript/issues/9568
      let textEdit: TextEdit | undefined;

      for (const res of items) {
        let type = '';
        switch (res.kind) {
          case 12:
            type = 'constant';
            break;
          case 3:
            type = 'function';
            break;
        }

        // `apply` is the string that will be used when the completion is performed.
        // By default it's the same value as the label (i.e the same string as the one shown in the completionList)
        let apply = res.label;
        if (res.textEdit) {
          apply = res.textEdit.newText;
          textEdit = res.textEdit;
        }
        options.push({ label: res.label, original: res.label, apply: apply, type: type, score: 0 });
      }

      // `from` and `to` are the absolute value in term of character and doesn't consider the line number.
      // So we have to calculate the position of "from".
      // `to` is the direct value of pos
      return {
        from: textEdit ? line.from + textEdit.range.start.character : line.from,
        to: pos,
        options: options,
      } as CompletionResult;
    });
  }
}
