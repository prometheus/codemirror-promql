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
import { LSPComplete } from './lsp';
import { HybridComplete } from './hybrid';
import { HTTPLSPClient, LSPClient } from '../client/lsp';
import { HTTPPrometheusClient, PrometheusClient } from '../client/prometheus';
import { HTTPClient } from '../client';
// Complete is the interface that defines the simple method that returns a CompletionResult.
// Every different completion mode must implement this interface.
export interface CompleteStrategy {
  promQL(context: AutocompleteContext): Promise<CompletionResult> | CompletionResult | null;
}

// CompleteConfiguration should be used to customize the autocompletion.
export interface CompleteConfiguration {
  lsp?: {
    // Provide these settings when not using a custom LSPClient.
    url?: string;
    httpErrorHandler?: (error: any) => void;
    httpClient?: HTTPClient;

    // When providing this custom LSPClient, the settings above will not be used.
    lspClient?: LSPClient;
  };
  hybrid?: {
    // Provide these settings when not using a custom PrometheusClient.
    url?: string;
    lookbackInterval?: number;
    httpErrorHandler?: (error: any) => void;
    httpClient?: HTTPClient;

    // When providing this custom PrometheusClient, the settings above will not be used.
    prometheusClient?: PrometheusClient;
  };
}

export function newCompleteStrategy(conf?: CompleteConfiguration): CompleteStrategy {
  if (conf?.lsp) {
    const lspConf = conf.lsp;
    if (lspConf.lspClient) {
      return new LSPComplete(lspConf.lspClient);
    }
    if (lspConf.url) {
      return new LSPComplete(new HTTPLSPClient(lspConf.url, lspConf.httpErrorHandler, lspConf.httpClient));
    }
    throw new Error('the url or the lspClient must be set');
  }
  if (conf?.hybrid) {
    const hybridConf = conf.hybrid;
    if (hybridConf.prometheusClient) {
      return new HybridComplete(hybridConf.prometheusClient);
    }
    if (hybridConf.url) {
      return new HybridComplete(
        new HTTPPrometheusClient(hybridConf.url, hybridConf.httpErrorHandler, hybridConf.lookbackInterval, hybridConf.httpClient)
      );
    }
    throw new Error('the url or the prometheusClient must be set');
  }
  return new HybridComplete();
}
