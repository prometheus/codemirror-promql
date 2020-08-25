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

import { NodeType, Subtree } from 'lezer-tree';

function contains(nodeType: NodeType, nodes: (number | string)[]): boolean {
  let result = false;
  let i = 0;
  while (i < nodes.length && !result) {
    result = nodeType.id === nodes[i] || nodeType.name === nodes[i];
    i++;
  }
  return result;
}

export function walkBackward(node: Subtree, exit: number) {
  let result: Subtree | null = node;
  while (result && result.type.id !== exit) {
    result = result.parent;
  }
  return result;
}

export function walkThrough(node: Subtree, ...path: (number | string)[]): Subtree | undefined | null {
  let i = 0;
  // Somehow, the first type is always the given node.
  // So we have to manually move forward before considering the given path.
  // A way to achieve that is to manually add the given node in the path
  path.unshift(node.type.id);
  return node.iterate<Subtree | null>({
    enter: (type, start) => {
      if (type.id === path[i] || type.name === path[i]) {
        i++;
        if (i >= path.length) {
          // We reached the last node. We should return it then.
          // First get the first node resolved at the `start` position.
          let result: Subtree | null = node.resolve(start, -1);
          if (result.type.id === type.id && result.start === start) {
            return result;
          }
          // In case the first node returned is not the one expected,
          // then go to the deepest node at the `start` position and walk backward.
          // Note: workaround suggested here: https://github.com/codemirror/codemirror.next/issues/270#issuecomment-674855519
          result = node.resolve(start, 1);
          while (result && result.type.id !== type.id) {
            result = result.parent;
          }
          return result;
        }
        // continue to loop on this node
        return undefined;
      }
      // go to the next node
      return false;
    },
  });
}

export function childExist(node: Subtree, ...child: (number | string)[]): boolean {
  // Somehow, the first type is always the given node.
  // So we have to manually move forward before considering the given path.
  // A way to achieve that is to manually add the given node in the path
  child.unshift(node.type.id);
  let depth = 0;
  const result = node.iterate<boolean>({
    enter: (type) => {
      if (type.id === node.type.id && depth === 0) {
        depth++;
        return undefined;
      }
      return contains(type, child);
    },
  });
  return result === undefined ? false : result;
}
