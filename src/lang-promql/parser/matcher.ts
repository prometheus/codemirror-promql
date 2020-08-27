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

import { Subtree } from 'lezer-tree';
import { EqlRegex, EqlSingle, LabelMatcher, LabelName, MatchOp, Neq, NeqRegex, StringLiteral } from 'lezer-promql';
import { EditorState } from '@codemirror/next/basic-setup';

class Matcher {
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
      case EqlRegex:
        return this.value === '';
      case Neq:
      case NeqRegex:
        return this.value !== '';
      default:
        return false;
    }
  }
}

function createMatcher(labelMatcher: Subtree, state: EditorState): Matcher {
  const matcher = new Matcher(0, '', '');
  labelMatcher.iterate({
    enter: (type, start, end) => {
      switch (type.id) {
        case LabelMatcher:
          return undefined;
        case LabelName:
          matcher.name = state.sliceDoc(start, end);
          break;
        case MatchOp:
          return undefined;
        case EqlSingle:
        case Neq:
        case EqlRegex:
        case NeqRegex:
          matcher.type = type.id;
          break;
        case StringLiteral:
          const value = state.sliceDoc(start, end);
          matcher.value = value === "''" || value === '""' || value === '``' ? '' : value;
          break;
      }
      return false;
    },
  });
  return matcher;
}

export function buildLabelMatchers(labelMatchers: Subtree[], state: EditorState): Matcher[] {
  const matchers: Matcher[] = [];
  labelMatchers.forEach((value) => {
    matchers.push(createMatcher(value, state));
  });
  return matchers;
}
