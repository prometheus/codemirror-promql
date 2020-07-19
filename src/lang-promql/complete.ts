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

import { AutocompleteContext, Completion, CompletionResult } from "@codemirror/next/autocomplete";
import { LSPBody, LSPClient } from "./lsp/client";
import { CompletionItem, TextEdit } from "vscode-languageserver-types";

// Complete is the interface that defines the simple method that returns a CompletionResult
// Every different completion mode must implement this interface
interface Complete {
  promQL(context: AutocompleteContext): Promise<CompletionResult> | CompletionResult | null;
}

// LSPComplete will proviode an autocompletion based on what the langserver-promql is providing when requested
class LSPComplete implements Complete {
  private readonly lspClient: LSPClient;

  constructor(lspClient: LSPClient) {
    this.lspClient = lspClient;
  }

  promQL(context: AutocompleteContext): Promise<CompletionResult> {
    const {state, pos} = context
    const line = state.doc.lineAt(pos)
    const body: LSPBody = {
      expr: state.doc.sliceString(0),
      limit: 100,
      // positionChar start at 0 at the beginning of the line for LSP
      positionChar: pos - line.from - 1 > 0 ? pos - line.from - 1 : pos - line.from,
      // positionLine start at 0 from LSP and at 1 from CMN
      positionLine: line.number - 1,
    }
    return this.lspClient.complete(body)
      .then((items: CompletionItem[]) => {
        const options: Completion[] = []
        // for every `textEdit` present, they all have exactly the same `range.start` value.
        // so the goal is to save the last one present in order to use it later to calculate the position `from`
        // Note: textEdit can be undefined but that's just because otherwise it doesn't compile
        // see more here: https://github.com/microsoft/TypeScript/issues/12916
        // and here https://github.com/microsoft/TypeScript/issues/9568
        let textEdit: TextEdit | undefined

        if (items) {
          for (const res of items) {
            // TODO map kind with icon Completion.type when it is released on CMN side
            // https://github.com/codemirror/codemirror.next/commit/459bba29c1fd1d80fc4f36dac27e5825b2362273

            // `apply` is the string that will be used when the completion is performed.
            // By default it's the same value as the label (i.e the same string as the one shown in the completionList)
            let apply = res.label
            if (res.textEdit) {
              apply = res.textEdit.newText
              textEdit = res.textEdit
            }
            options.push({label: res.label, apply: apply})
          }
        }

        // `from` and `to` are the absolute value in term of character and doesn't consider the line number
        // so we have to calculate the position of "from"
        // `to` is the direct value of pos
        return {
          from: textEdit ? line.from + textEdit.range.start.character : line.from,
          to: pos,
          options: options
        } as CompletionResult
      })
  }
}

// OfflineComplete is going to provide a full completion result without any distant server
// So it will basically only provide the different keyword of the PromQL syntax
class OfflineComplete implements Complete {
  // TODO to be implemented with a deep analyze of the tree to have an accurate result
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  promQL(context: AutocompleteContext): null {
    return null
  }
}

function newCompleteObject(onlineMode: boolean): Complete {
  if (onlineMode) {
    // TODO find a way to assign properly the url
    return new LSPComplete(new LSPClient("http://localhost:8080"))
  }
  return new OfflineComplete()
}

export function completePromQL(context: AutocompleteContext): Promise<CompletionResult> | CompletionResult | null {
  // TODO find a way to assign properly the mode, same pb as the URL.
  const complete = newCompleteObject(true)
  return complete.promQL(context)
}
