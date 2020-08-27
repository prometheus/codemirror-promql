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

import { CompletionItem, Diagnostic } from 'vscode-languageserver-types';
import { FetchFn } from '.';

export interface LSPBody {
  expr: string;
  limit: number;
  positionLine?: number;
  positionChar?: number;
}

export interface LSPClient {
  complete(body: LSPBody): Promise<CompletionItem[]>;
  diagnostic(body: LSPBody): Promise<Diagnostic[]>;
}

// HTTPLSPClient is the HTTP client that should be used to get some information from the different endpoint provided by langserver-promql.
export class HTTPLSPClient implements LSPClient {
  private readonly url: string;
  private readonly autocompleteEndpoint = '/completion';
  private readonly diagnosticEndpoint = '/diagnostics';
  private readonly errorHandler?: (error: any) => void;
  // For some reason, just assigning via "= fetch" here does not end up executing fetch correctly
  // when calling it, thus the indirection via another function wrapper.
  private readonly fetchFn: FetchFn = (input: RequestInfo, init?: RequestInit): Promise<Response> => fetch(input, init);

  constructor(url: string, errorHandler?: (error: any) => void, fetchFn?: FetchFn) {
    this.url = url;
    this.errorHandler = errorHandler;
    if (fetchFn) {
      this.fetchFn = fetchFn;
    }
  }

  private fetchLSP<T>(endpoint: string, body: LSPBody): Promise<T> {
    return this.fetchFn(this.url + endpoint, { method: 'POST', body: JSON.stringify(body) })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(res.statusText);
        }
        return res;
      })
      .then((res) => res.json())
      .catch((error) => {
        if (this.errorHandler) {
          this.errorHandler(error);
        }
        return [];
      });
  }

  complete(body: LSPBody): Promise<CompletionItem[]> {
    return this.fetchLSP(this.autocompleteEndpoint, body);
  }

  diagnostic(body: LSPBody): Promise<Diagnostic[]> {
    return this.fetchLSP(this.diagnosticEndpoint, body);
  }
}
