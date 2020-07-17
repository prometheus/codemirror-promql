// TODO consider to use the interface coming from LSP
// https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_completion
export interface TextEdit {
  range: {
    start: {
      line: number;
      character: number;
    };
    end: {
      line: number;
      character: number;
    };
  };
  newText: string;
}

export interface AutocompleteResponse {
  label: string;
  kind: number;
  textEdit?: TextEdit;
}
