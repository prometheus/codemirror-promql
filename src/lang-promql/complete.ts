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

import { AutocompleteContext, CompletionResult } from "@codemirror/next/autocomplete";
import { LSPClient } from "./lsp/client";

// Complete is the interface that defines the simple method that returns a CompletionResult
// Every different completion mode must implement this interface
interface Complete {
  completePromQL(context: AutocompleteContext): Promise<CompletionResult> | CompletionResult | null;
}

// LSPComplete will proviode an autocompletion based on what the langserver-promql is providing when requested
class LSPComplete implements Complete {
  private readonly lspClient: LSPClient;

  constructor(lspClient: LSPClient) {
    this.lspClient = lspClient;
  }

  completePromQL(context: AutocompleteContext): Promise<CompletionResult> {
    return this.lspClient.complete(context)
  }
}

// OfflineComplete is going to provide a full completion result without any distant server
// So it will basically only provide the different keyword of the PromQL syntax
class OfflineComplete implements Complete {
  // TODO to be implemented with a deep analyze of the tree to have an accurate result
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  completePromQL(context: AutocompleteContext): null {
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
  return complete.completePromQL(context)
}
