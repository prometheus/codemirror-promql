import { parser } from 'lezer-promql';
import chai from 'chai';
import { EditorState } from '@codemirror/next/state';
import { Parser } from './parser';
import { LezerSyntax } from '@codemirror/next/syntax';
import { ValueType } from './type';
import { Diagnostic } from '@codemirror/next/lint';

const promQLSyntax = LezerSyntax.define(parser);

describe('Scalars and scalar-to-scalar operations', () => {
  const testSuites = [
    {
      expr: '1',
      expectedValueType: ValueType.scalar,
      expectedDiag: [] as Diagnostic[],
    },
  ];
  testSuites.forEach((value) => {
    const state = EditorState.create({
      doc: value.expr,
      extensions: promQLSyntax,
    });
    const parser = new Parser(state);
    it(value.expr, () => {
      chai.expect(parser.checkAST(state.tree.firstChild)).to.equal(value.expectedValueType);
      chai.expect(parser.getDiagnostics()).to.deep.equal(value.expectedDiag);
    });
  });
});
