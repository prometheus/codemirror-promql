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

import { CompleteStrategy } from './index';
import { Subtree } from 'lezer-tree';
import { PrometheusClient } from '../client';
import {
  BinaryExpr,
  GroupingLabel,
  GroupingLabels,
  Identifier,
  LabelMatcher,
  LabelMatchers,
  LabelName,
  MetricIdentifier,
  VectorSelector,
} from 'lezer-promql';
import { Completion, CompletionContext, CompletionResult } from '@codemirror/next/autocomplete';
import { EditorState } from '@codemirror/next/state';
import { walkBackward, walkThrough } from '../parser/path-finder';
import {
  aggregateOpModifierTerms,
  aggregateOpTerms,
  binOpModifierTerms,
  binOpTerms,
  functionIdentifierTerms,
  matchOpTerms,
  snippets,
} from './promql.terms';

interface AutoCompleteNode {
  label: string;
  detail?: string;
  info?: string;
}

interface AutoCompleteNodes {
  nodes: AutoCompleteNode[];
  type?: string;
}

const autocompleteNode: { [key: string]: AutoCompleteNodes } = {
  matchOp: { nodes: matchOpTerms },
  binOp: { nodes: binOpTerms },
  binOpModifier: { nodes: binOpModifierTerms, type: 'keyword' },
  functionIdentifier: { nodes: functionIdentifierTerms, type: 'function' },
  aggregateOp: { nodes: aggregateOpTerms, type: 'keyword' },
  aggregateOpModifier: { nodes: aggregateOpModifierTerms, type: 'keyword' },
};

// ContextKind is the different possible value determinate by the autocompletion
export enum ContextKind {
  // dynamic autocompletion (required a distant server)
  MetricName,
  LabelName,
  LabelValue,
  // static autocompletion
  Function,
  Aggregation,
  BinOpModifier,
}

export interface Context {
  kind: ContextKind;
  metricName?: string;
  labelName?: string;
}

function getMetricNameInVectorSelector(tree: Subtree, state: EditorState): string {
  // Find if there is a defined metric name. Should be used to autocomplete a labelValue or a labelName
  // First find the parent "VectorSelector" to be able to find then the subChild "MetricIdentifier" if it exists.
  let currentNode: Subtree | undefined | null = walkBackward(tree, VectorSelector);
  if (!currentNode) {
    // Weird case that shouldn't happen, because "VectorSelector" is by definition the parent of the LabelMatchers.
    return '';
  }
  currentNode = walkThrough(currentNode, MetricIdentifier, Identifier);
  if (!currentNode) {
    return '';
  }
  return state.sliceDoc(currentNode.start, currentNode.end);
}

function arrayToCompletionResult(data: AutoCompleteNodes[], from: number, to: number, includeSnippet = false): CompletionResult {
  const options: Completion[] = [];

  for (const completionList of data) {
    for (const node of completionList.nodes) {
      options.push({
        label: node.label,
        type: completionList.type,
        detail: node.detail,
        info: node.info,
      });
    }
  }
  if (includeSnippet) {
    options.push(...snippets);
  }
  return {
    from: from,
    to: to,
    options: options,
    span: /^[a-zA-Z0-9_:]+$/,
  } as CompletionResult;
}

// HybridComplete provides a full completion result with or without a remote prometheus.
export class HybridComplete implements CompleteStrategy {
  private readonly prometheusClient: PrometheusClient | undefined;

  constructor(prometheusClient?: PrometheusClient) {
    this.prometheusClient = prometheusClient;
  }

  promQL(context: CompletionContext): Promise<CompletionResult> | CompletionResult | null {
    const { state, pos } = context;
    const tree = state.tree.resolve(pos, -1);
    const contexts = this.analyzeCompletion(state, tree);
    let asyncResult: Promise<AutoCompleteNodes[]> = Promise.resolve([]);
    for (const context of contexts) {
      switch (context.kind) {
        case ContextKind.Aggregation:
          asyncResult = asyncResult.then((result) => {
            return result.concat(autocompleteNode.aggregateOp);
          });
          break;
        case ContextKind.Function:
          asyncResult = asyncResult.then((result) => {
            return result.concat(autocompleteNode.functionIdentifier);
          });
          break;
        case ContextKind.BinOpModifier:
          asyncResult = asyncResult.then((result) => {
            return result.concat(autocompleteNode.binOpModifier);
          });
          break;
        case ContextKind.MetricName:
          asyncResult = asyncResult.then((result) => {
            return this.autocompleteMetricName(result);
          });
          break;
        case ContextKind.LabelName:
          asyncResult = asyncResult.then((result) => {
            return this.autocompleteLabelName(result, context.metricName);
          });
          break;
      }
    }
    return asyncResult.then((result) => {
      return arrayToCompletionResult(result, tree.start, pos);
    });
  }

  // analyzeCompletion is going to determinate what should be autocompleted.
  // The value of the autocompletion is then calculate by the function buildCompletion.
  // Note: this method is public for testing purpose only. Do not use it directly.
  analyzeCompletion(state: EditorState, node: Subtree): Context[] {
    const result: Context[] = [];
    switch (node.type.id) {
      case Identifier:
        // according to the grammar, identifier is by definition a leaf of the node MetricIdentifier
        // it could also possible to be a function or an aggregation.
        result.push({ kind: ContextKind.MetricName }, { kind: ContextKind.Function }, { kind: ContextKind.Aggregation });

        if (node.parent?.parent?.parent?.parent?.type.id === BinaryExpr) {
          // This is for autocompleting binary operator modifiers (on / ignoring / group_x). When we get here, we have something like:
          //       metric_name / ignor
          // And the tree components above the half-finished set operator will look like:
          //
          // Identifier -> MetricIdentifier -> VectorSelector -> Expr -> BinaryExpr.
          result.push({ kind: ContextKind.BinOpModifier });
        }
        break;
      case GroupingLabels:
        // In this case we are in the given situation:
        //      sum by ()
        // So we have to autocomplete any labelName
        result.push({ kind: ContextKind.LabelName });
        break;
      case LabelMatchers:
        // In that case we are in the given situation:
        //       metric_name{} or {}
        // so we have or to autocomplete any kind of labelName or to autocomplete only the labelName associated to the metric
        result.push({ kind: ContextKind.LabelName, metricName: getMetricNameInVectorSelector(node, state) });
        break;
      case LabelName:
        if (node.parent?.type.id === GroupingLabel) {
          // In this case we are in the given situation:
          //      sum by (myL)
          // So we have to continue to autocomplete any kind of labelName
          result.push({ kind: ContextKind.LabelName });
        } else if (node.parent?.type.id === LabelMatcher) {
          // In that case we are in the given situation:
          //       metric_name{myL} or {myL}
          // so we have or to continue to autocomplete any kind of labelName or
          // to continue to autocomplete only the labelName associated to the metric
          result.push({ kind: ContextKind.LabelName, metricName: getMetricNameInVectorSelector(node, state) });
        }
        break;
    }
    return result;
  }

  private autocompleteMetricName(result: AutoCompleteNodes[]) {
    if (!this.prometheusClient) {
      return result;
    }
    const metricCompletion = new Map<string, AutoCompleteNode>();
    return this.prometheusClient
      .labelValues('__name__')
      .then((metricNames: string[]) => {
        for (const metricName of metricNames) {
          metricCompletion.set(metricName, { label: metricName });
        }

        // avoid to get all metric metadata if the prometheus server is too big
        if (metricNames.length <= 10000) {
          // in order to enrich the completion list of the metric,
          // we are trying to find the associated metadata
          return this.prometheusClient?.metricMetadata();
        }
      })
      .then((metricMetadata) => {
        if (metricMetadata) {
          for (const [metricName, node] of metricCompletion) {
            const metadata = metricMetadata.get(metricName);
            if (metadata) {
              if (metadata.length > 1) {
                // it means the metricName has different possible helper and type
                node.detail = 'unknown';
              } else if (metadata.length === 1) {
                node.detail = metadata[0].type;
                node.info = metadata[0].help;
              }
            }
          }
        }
        return result.concat([{ nodes: Array.from(metricCompletion.values()), type: 'constant' }]);
      });
  }

  private autocompleteLabelName(result: AutoCompleteNodes[], metricName?: string) {
    if (!this.prometheusClient) {
      return result;
    }
    return this.prometheusClient.labelNames(metricName).then((labelNames: string[]) => {
      return result.concat([
        {
          nodes: labelNames.map((value) => ({ label: value })),
          type: 'constant',
        },
      ]);
    });
  }
}
