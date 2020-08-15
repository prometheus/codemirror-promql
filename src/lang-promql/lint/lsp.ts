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
