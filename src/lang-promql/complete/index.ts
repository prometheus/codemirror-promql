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

import { AutocompleteContext, CompletionResult } from '@nexucis/codemirror-next-autocomplete';
import { LSPClient } from './lsp/client';
import { LSPComplete } from './lsp';
import { HybridComplete } from './hybrid';
import { PrometheusClient } from './prometheus/client';

// Complete is the interface that defines the simple method that returns a CompletionResult.
// Every different completion mode must implement this interface.
export interface Complete {
  promQL(context: AutocompleteContext): Promise<CompletionResult> | CompletionResult | null;
}

// CompleteConfiguration should be used to customize the autocompletion.
export interface CompleteConfiguration {
  enableLSP: boolean;
  offline: boolean;
  url: string;
}

function newCompleteObject(conf: CompleteConfiguration): Complete {
  if (conf.enableLSP) {
    return new LSPComplete(new LSPClient(conf.url));
  }
  if (conf.offline) {
    return new HybridComplete(null);
  }
  return new HybridComplete(new PrometheusClient(conf.url));
}

// complete is the unique instance of the Complete interface. It means that the autocompletion for promQL is for the moment stateful.
// With other words, that means all CodeMirror instances will share the same `complete` object,
// and so you cannot (for the moment) instantiate one CodeMirror dedicated to an instance A of prometheus and another one for an instance B of prometheus.
let complete: Complete;

// setComplete should be called in order to customize the autocompletion mode.
export function setComplete(conf: CompleteConfiguration): void {
  complete = newCompleteObject(conf);
}

export function completePromQL(context: AutocompleteContext): Promise<CompletionResult> | CompletionResult | null {
  if (!complete) {
    complete = newCompleteObject({ enableLSP: false, url: '', offline: true });
  }
  return complete.promQL(context);
}
