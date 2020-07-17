import { AutocompleteContext, CompletionResult } from "@codemirror/next/autocomplete";
import { LSPClient } from "./lsp/client";

export function completePromQL(context: AutocompleteContext): Promise<CompletionResult> {
  // TODO find a way to assign properly the url
  const lspClient = new LSPClient("http://localhost:8080")
  // TODO use the lspclient only for an "online" mode.
  // A deep analyze of the tree should be done for the "offline" mode
  return lspClient.autocomplete(context)
}
