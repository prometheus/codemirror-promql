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

import { EditorView } from '@codemirror/next/view';
import { Diagnostic, linter } from '@codemirror/next/lint';
import { LSPLint } from './lsp';
import { HTTPLSPClient, LSPClient } from '../client/lsp';
import { HybridLint } from './hybrid';

type lintFunc = (view: EditorView) => readonly Diagnostic[] | Promise<readonly Diagnostic[]>;

// LintStrategy is the interface that defines the simple method that returns a DiagnosticResult.
// Every different lint mode must implement this interface.
export interface LintStrategy {
  promQL(this: LintStrategy): lintFunc;
}

// LintConfiguration should be used to customize the autocompletion.
export interface LintConfiguration {
  lsp?: {
    url?: string;
    lspClient?: LSPClient;
    httpErrorHandler?: (error: any) => void;
  };
}

export function newLintStrategy(conf?: LintConfiguration): LintStrategy {
  if (conf?.lsp) {
    const lspConf = conf.lsp;
    if (lspConf.lspClient) {
      return new LSPLint(lspConf.lspClient);
    }
    if (lspConf.url) {
      return new LSPLint(new HTTPLSPClient(lspConf.url, lspConf.httpErrorHandler));
    }
    throw new Error('the url or the lspClient must be set');
  }
  return new HybridLint();
}

export function promQLLinter(callbackFunc: (this: LintStrategy) => lintFunc, thisArg: LintStrategy) {
  return linter(callbackFunc.call(thisArg));
}
