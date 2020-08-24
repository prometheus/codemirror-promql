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

import { LintStrategy } from './index';
import { Diagnostic } from '@codemirror/next/lint';
import { EditorView } from '@codemirror/next/view';
import { LSPBody, LSPClient } from '../client';

// LSPLint will provide a promQL linter based on what the langserver-promql is providing when requested.
export class LSPLint implements LintStrategy {
  private lspClient: LSPClient;

  constructor(lspClient: LSPClient) {
    this.lspClient = lspClient;
  }

  public promQL(this: LSPLint): (view: EditorView) => Promise<readonly Diagnostic[]> {
    return (view: EditorView) => {
      const state = view.state;
      const expr = state.sliceDoc(0, state.doc.length);
      const body: LSPBody = {
        expr: expr,
        limit: 100,
      };
      return this.lspClient.diagnostic(body).then((items) => {
        const diagnostics: Diagnostic[] = [];
        for (const diag of items) {
          const lineFrom = state.doc.line(diag.range.start.line + 1);
          const lineTo = state.doc.line(diag.range.end.line + 1);
          diagnostics.push({
            message: diag.message,
            severity: 'error',
            from: lineFrom.from + diag.range.start.character,
            to: lineTo.from + diag.range.end.character,
          });
        }
        return diagnostics.sort((a, b) => {
          return a.from - b.from;
        });
      });
    };
  }
}
