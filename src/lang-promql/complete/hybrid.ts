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

import { AutocompleteContext, Completion, CompletionResult } from "@codemirror/next/autocomplete";
import { Complete } from "./index";
import { PrometheusClient } from "./prometheus/client";
import { Subtree } from "lezer-tree"
import { EditorState } from "@codemirror/next/basic-setup";

// TODO: filter every list returned by the prometheusClient

// HybridComplete is going to provide a full completion result with or without a distant prometheus.
export class HybridComplete implements Complete {
  private readonly prometheusClient: PrometheusClient;

  constructor(prometheusClient: PrometheusClient) {
    this.prometheusClient = prometheusClient;
  }

  promQL(context: AutocompleteContext): Promise<CompletionResult> | null {
    const {state, pos} = context
    const tree = state.tree.resolve(pos, -1)
    if (tree.name === "GroupingLabels" || (tree.parent?.name === "GroupingLabel" && tree.name === "LabelName")) {
      // In that case we are in the given situation:
      //      sum by ()
      // So we have to autocomplete any labelName
      return this.labelNames(tree, pos)
    }
    if (tree.name === "LabelMatchers" || (tree.parent?.name === "LabelMatcher" && tree.name === "LabelName")) {
      // In that case we are in the given situation:
      //       metric_name{} or {}
      return this.autocompleteLabelNamesByMetric(tree, pos, state)
    }
    if (tree.parent?.name === "LabelMatcher" && tree.name === "StringLiteral") {
      // In that case we are in the given situation:
      //      metric_name{labelName=""}
      // So we can autocomplete the labelValue
      return this.autocompleteLabelValue(tree.parent, tree, pos, state)
    }
    return null
  }

  private autocompleteLabelValue(parent: Subtree, current: Subtree, pos: number, state: EditorState): Promise<CompletionResult> | null {
    // First get the labelName.
    // By definition it's the firstChild: https://github.com/promlabs/lezer-promql/blob/0ef65e196a8db6a989ff3877d57fd0447d70e971/src/promql.grammar#L250
    if (!parent.firstChild || parent.firstChild.name !== "LabelName") {
      // If it's not the case, then just stop to try to autocomplete it
      return null
    }
    return this.prometheusClient.labelValues(state.sliceDoc(parent.firstChild.start, parent.firstChild.end))
      .then((labelValues: string[]) => {
        const options: Completion[] = []
        for (const value of labelValues) {
          options.push({label: value})
        }
        return {
          // +1 to avoid to remove the first quote.
          from: current.start + 1,
          to: pos,
          options: options
        } as CompletionResult
      })
  }

  private autocompleteLabelNamesByMetric(tree: Subtree, pos: number, state: EditorState): Promise<CompletionResult> {
    // So we have to find if there is a defined metric name and then to autocomplete the associated labelName.
    // First find the parent "VectorSelector" to be able to find then the subChild "MetricIdentifier" if it exists.
    let currentNode: Subtree | null = tree
    while (currentNode && currentNode.name !== "VectorSelector") {
      currentNode = currentNode.parent
    }
    if (!currentNode) {
      // Weird case that shouldn't happen, because "VectorSelector" is by definition the parent of the LabelMatchers.
      // In case it's happening, then at least return all labelNames.
      return this.labelNames(tree, pos)
    }
    // By definition "MetricIdentifier" is necessary the first child if it exists
    if (!currentNode.firstChild || currentNode.firstChild.name !== "MetricIdentifier") {
      // If it doesn't exist then we are in the given situation
      //     {}
      return this.labelNames(tree, pos)
    }
    // Let's move forward to the next child.
    currentNode = currentNode.firstChild
    // By definition the next child should be an "Identifier" which contains the metricName
    if (!currentNode.firstChild || currentNode.firstChild.name !== "Identifier") {
      // If it's not the case, then return all labelName
      return this.labelNames(tree, pos)
    }
    currentNode = currentNode.firstChild
    return this.labelNames(tree, pos, state.sliceDoc(currentNode.start, currentNode.end))
  }

  private labelNames(tree: Subtree, pos: number, metricName?: string): Promise<CompletionResult> {
    return this.prometheusClient.labelNames(metricName)
      .then((labelNames: string[]) => {
        const options: Completion[] = []
        for (const name of labelNames) {
          options.push({label: name})
        }
        return {
          // this case can happen when you are in empty bracket. Then you don't want to remove the first bracket
          from: tree.name === "GroupingLabels" || tree.name === "LabelMatchers" ? tree.start + 1 : tree.start,
          to: pos,
          options: options
        } as CompletionResult
      })
  }
}
