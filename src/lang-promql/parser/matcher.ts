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

import { SyntaxNode } from 'lezer-tree';
import { EqlSingle, LabelName, MatchOp, Neq, StringLiteral } from 'lezer-promql';
import { EditorState } from '@codemirror/next/basic-setup';

export class Matcher {
  type: number;
  name: string;
  value: string;

  constructor(type: number, name: string, value: string) {
    this.type = type;
    this.name = name;
    this.value = value;
  }

  matchesEmpty(): boolean {
    switch (this.type) {
      case EqlSingle:
        return this.value === '';
      case Neq:
        return this.value !== '';
      default:
        return false;
    }
  }
}

function createMatcher(labelMatcher: SyntaxNode, state: EditorState): Matcher {
  const matcher = new Matcher(0, '', '');
  const cursor = labelMatcher.cursor;
  if (!cursor.next()) {
    // weird case, that would mean the labelMatcher doesn't have any child.
    return matcher;
  }
  do {
    switch (cursor.type.id) {
      case LabelName:
        matcher.name = state.sliceDoc(cursor.from, cursor.to);
        break;
      case MatchOp:
        const ope = cursor.node.firstChild;
        if (ope) {
          matcher.type = ope.type.id;
        }
        break;
      case StringLiteral:
        matcher.value = state.sliceDoc(cursor.from, cursor.to).slice(1, -1);
        break;
    }
  } while (cursor.nextSibling());
  return matcher;
}

export function buildLabelMatchers(labelMatchers: SyntaxNode[], state: EditorState): Matcher[] {
  const matchers: Matcher[] = [];
  labelMatchers.forEach((value) => {
    matchers.push(createMatcher(value, state));
  });
  return matchers;
}
