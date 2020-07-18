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
