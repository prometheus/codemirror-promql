import { LintStrategy } from './index';
import { EditorView } from '@codemirror/next/view';
import { Diagnostic } from '@codemirror/next/lint';

// HybridLint will provide a promQL linter with static analysis
export class HybridLint implements LintStrategy {
  public promQL(this: HybridLint): (view: EditorView) => readonly Diagnostic[] {
    return (view: EditorView) => {
      return [];
    };
  }
}
