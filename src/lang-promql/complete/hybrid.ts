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

interface AutoCompleteNode {
  labels: string[];
  type: string;
}

const autocompleteNode = {
  "MatchOp": {
    labels: [
      "=",
      "!=",
      "=~",
      "!~"
    ],
    type: ""
  },
  "BinaryExpr": {
    labels: [
      "^",
      "*",
      "/",
      "%",
      "+",
      "-",
      "==",
      ">=",
      ">",
      "<",
      "<=",
      "!=",
      "and",
      "or",
      "unless"
    ],
    type: ""
  },
  "FunctionIdentifier": {
    labels: [
      "abs",
      "absent",
      "absent_over_time",
      "avg_over_time",
      "ceil",
      "changes",
      "clamp_max",
      "clamp_min",
      "count_over_time",
      "days_in_month",
      "day_of_month",
      "day_of_week",
      "delta",
      "deriv",
      "exp",
      "floor",
      "histogram_quantile",
      "holt_winters",
      "hour",
      "idelta",
      "increase",
      "irate",
      "label_replace",
      "label_join",
      "ln",
      "log10",
      "log2",
      "max_over_time",
      "min_over_time",
      "minute",
      "month",
      "predict_linear",
      "quantile_over_time",
      "rate",
      "resets",
      "round",
      "scalar",
      "sort",
      "sort_desc",
      "sqrt",
      "stddev_over_time",
      "stdvar_over_time",
      "sum_over_time",
      "time",
      "timestamp",
      "vector",
      "year"
    ],
    type: "function",
  },
  "AggregateOp": {
    labels: [
      "avg",
      "bottomk",
      "count",
      "count_values",
      "group",
      "max",
      "min",
      "quantile",
      "stddev",
      "stdvar",
      "sum",
      "topk",
    ],
    type: "keyword"
  }
}

function arrayToCompletionResult(data: AutoCompleteNode[], from: number, to: number, context: AutocompleteContext, state: EditorState): CompletionResult {
  const text = state.sliceDoc(from, to)
  const options: Completion[] = []
  for (const completionList of data) {
    for (const label of completionList.labels)
      if (context.filter(label, text, true)) {
        options.push({label: label, apply: "", type: completionList.type})
      }
  }
  return {
    from: from,
    to: to,
    options: options
  } as CompletionResult
}

// HybridComplete is going to provide a full completion result with or without a remote prometheus.
export class HybridComplete implements Complete {
  private readonly prometheusClient: PrometheusClient | null;

  constructor(prometheusClient: PrometheusClient | null) {
    this.prometheusClient = prometheusClient;
  }

  promQL(context: AutocompleteContext): Promise<CompletionResult> | CompletionResult | null {
    const {state, pos} = context
    const tree = state.tree.resolve(pos, -1)
    if (tree.parent?.name === "MetricIdentifier" && tree.name === "Identifier") {
      // Here we cannot know if we have to autocomplete the metric_name, or the function or the aggregation.
      // So we will just autocomplete everything
      if (this.prometheusClient) {
        return this.prometheusClient.labelValues("__name__")
          .then((metricNames: string[]) => {
            const result: AutoCompleteNode[] = [ {labels: metricNames, type: "constant"} ]
            return arrayToCompletionResult(result.concat(autocompleteNode[ "FunctionIdentifier" ], autocompleteNode[ "AggregateOp" ]), tree.start, pos, context, state)
          })
      }
      return arrayToCompletionResult([ autocompleteNode[ "FunctionIdentifier" ] ].concat(autocompleteNode[ "AggregateOp" ]), tree.start, pos, context, state)
    }
    if (tree.name === "GroupingLabels" || (tree.parent?.name === "GroupingLabel" && tree.name === "LabelName")) {
      // In this case we are in the given situation:
      //      sum by ()
      // So we have to autocomplete any labelName
      return this.labelNames(tree, pos, context, state)
    }
    if (tree.name === "LabelMatchers" || (tree.parent?.name === "LabelMatcher" && tree.name === "LabelName")) {
      // In that case we are in the given situation:
      //       metric_name{} or {}
      return this.autocompleteLabelNamesByMetric(tree, pos, context, state)
    }
    if (tree.parent?.name === "LabelMatcher" && tree.name === "StringLiteral") {
      // In this case we are in the given situation:
      //      metric_name{labelName=""}
      // So we can autocomplete the labelValue
      return this.autocompleteLabelValue(tree.parent, tree, pos, context, state)
    }
    if (tree.name === "MatchOp") {
      return arrayToCompletionResult([ autocompleteNode[ "MatchOp" ] ], tree.start, pos, context, state)
    }
    if (tree.parent?.name === "BinaryExpr") {
      return arrayToCompletionResult([ autocompleteNode[ "BinaryExpr" ] ], tree.start, pos, context, state)
    }
    if (tree.parent?.name === "FunctionIdentifier") {
      return arrayToCompletionResult([ autocompleteNode[ "FunctionIdentifier" ] ], tree.start, pos, context, state)
    }
    if (tree.parent?.name === "AggregateOp") {
      return arrayToCompletionResult([ autocompleteNode[ "AggregateOp" ] ], tree.start, pos, context, state)
    }
    return null
  }

  private autocompleteLabelValue(parent: Subtree, current: Subtree, pos: number, context: AutocompleteContext, state: EditorState): Promise<CompletionResult> | null {
    if (!this.prometheusClient) {
      return null
    }
    // First get the labelName.
    // By definition it's the firstChild: https://github.com/promlabs/lezer-promql/blob/0ef65e196a8db6a989ff3877d57fd0447d70e971/src/promql.grammar#L250
    let labelName = ""
    if (this.prometheusClient && parent.firstChild && parent.firstChild.name === "LabelName") {
      labelName = state.sliceDoc(parent.firstChild.start, parent.firstChild.end)
    }
    // then find the metricName if it exists
    const metricName = this.getMetricNameInVectorSelector(current, state)
    return this.prometheusClient.labelValues(labelName, metricName)
      .then((labelValues: string[]) => {
        // +1 to avoid to remove the first quote.
        return arrayToCompletionResult([ {labels: labelValues, type: "text"} ], current.start + 1, pos, context, state)
      })
  }

  private autocompleteLabelNamesByMetric(tree: Subtree, pos: number, context: AutocompleteContext, state: EditorState): Promise<CompletionResult> | null {
    return this.labelNames(tree, pos, context, state, this.getMetricNameInVectorSelector(tree, state))
  }

  private getMetricNameInVectorSelector(tree: Subtree, state: EditorState): string {
    // Find if there is a defined metric name. Should be used to autocomplete a labelValue or a labelName
    // First find the parent "VectorSelector" to be able to find then the subChild "MetricIdentifier" if it exists.
    let currentNode: Subtree | null = tree
    while (currentNode && currentNode.name !== "VectorSelector") {
      currentNode = currentNode.parent
    }
    if (!currentNode) {
      // Weird case that shouldn't happen, because "VectorSelector" is by definition the parent of the LabelMatchers.
      return ""
    }
    // By definition "MetricIdentifier" is necessary the first child if it exists
    if (!currentNode.firstChild || currentNode.firstChild.name !== "MetricIdentifier") {
      // If it doesn't exist then we are in the given situation
      //     {}
      return ""
    }
    // Let's move forward to the next child.
    currentNode = currentNode.firstChild
    // By definition the next child should be an "Identifier" which contains the metricName
    if (!currentNode.firstChild || currentNode.firstChild.name !== "Identifier") {
      return ""
    }
    currentNode = currentNode.firstChild
    return state.sliceDoc(currentNode.start, currentNode.end)
  }

  private labelNames(tree: Subtree, pos: number, context: AutocompleteContext, state: EditorState, metricName?: string): Promise<CompletionResult> | null {
    return !this.prometheusClient ? null : this.prometheusClient.labelNames(metricName)
      .then((labelNames: string[]) => {
        // this case can happen when you are in empty bracket. Then you don't want to remove the first bracket
        return arrayToCompletionResult([ {
            labels: labelNames,
            type: "constant"
          } ],
          tree.name === "GroupingLabels" || tree.name === "LabelMatchers" ? tree.start + 1 : tree.start, pos, context, state)
      })
  }
}
