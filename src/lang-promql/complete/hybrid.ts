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
import { EditorState } from '@codemirror/next/state';
import { PrometheusClient } from '../client';
import {
  AggregateOp,
  BinaryExpr,
  FunctionIdentifier,
  GroupingLabel,
  GroupingLabels,
  Identifier,
  LabelMatcher,
  LabelMatchers,
  LabelName,
  MatchOp,
  MetricIdentifier,
  StringLiteral,
  VectorSelector,
} from 'lezer-promql';
import { walkBackward, walkThrough } from '../parser/path-finder';
import { aggregateOpModifierTerms, aggregateOpTerms, binOpModifierTerms, binOpTerms, functionIdentifierTerms, matchOpTerms } from './promql.terms';
import { Completion, CompletionContext, CompletionResult, snippet } from '@codemirror/next/autocomplete';

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

const snippets: readonly Completion[] = [
  {
    label: 'sum(rate(__input_vector__[5m]))',
    type: 'function',
    apply: snippet('sum(rate(${__input_vector__}[5m]))'),
  },
  {
    label: 'histogram_quantile(__quantile__, sum by(le) (rate(__histogram_metric__[5m])))',
    type: 'function',
    apply: snippet('histogram_quantile(${__quantile__}, sum by(le) (rate(${__histogram_metric__}[5m])))'),
  },
  {
    label: 'label_replace(__input_vector__, "__dst__", "__replacement__", "__src__", "__regex__")',
    type: 'function',
    apply: snippet('label_replace(${__input_vector__}, "${__dst__}", "${__replacement__}", "${__src__}", "${__regex__}")'),
  },
];

// HybridComplete provides a full completion result with or without a remote prometheus.
export class HybridComplete implements CompleteStrategy {
  private readonly prometheusClient: PrometheusClient | undefined;

  constructor(prometheusClient?: PrometheusClient) {
    this.prometheusClient = prometheusClient;
  }

  promQL(context: CompletionContext): Promise<CompletionResult> | CompletionResult | null {
    const { state, pos } = context;
    const tree = state.tree.resolve(pos, -1);
    if (tree.parent?.type.id === MetricIdentifier && tree.type.id === Identifier) {
      let nonMetricCompletions = [autocompleteNode.functionIdentifier, autocompleteNode.aggregateOp, autocompleteNode.binOp];

      if (tree.parent?.parent?.parent?.parent?.type.id === BinaryExpr) {
        // This is for autocompleting binary operator modifiers (on / ignoring / group_x). When we get here, we have something like:
        //       metric_name / ignor
        // And the tree components above the half-finished set operator will look like:
        //
        // Identifier -> MetricIdentifier -> VectorSelector -> Expr -> BinaryExpr.
        nonMetricCompletions = nonMetricCompletions.concat(autocompleteNode.binOpModifier);
      }

      // Here we cannot know if we have to autocomplete the metric_name, or the function or the aggregation.
      // So we will just autocomplete everything
      if (this.prometheusClient) {
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
            const result: AutoCompleteNodes[] = [{ nodes: Array.from(metricCompletion.values()), type: 'constant' }];
            return this.arrayToCompletionResult(result.concat(nonMetricCompletions), tree.start, pos, true);
          });
      }
      return this.arrayToCompletionResult(nonMetricCompletions, tree.start, pos, true);
    }
    if (tree.type.id === GroupingLabels || (tree.parent?.type.id === GroupingLabel && tree.type.id === LabelName)) {
      // In this case we are in the given situation:
      //      sum by ()
      // So we have to autocomplete any labelName
      return this.labelNames(tree, pos);
    }
    if (tree.type.id === LabelMatchers || (tree.parent?.type.id === LabelMatcher && tree.type.id === LabelName)) {
      // In that case we are in the given situation:
      //       metric_name{} or {}
      return this.autocompleteLabelNamesByMetric(tree, pos, state);
    }
    if (tree.parent?.type.id === LabelMatcher && tree.type.id === StringLiteral) {
      // In this case we are in the given situation:
      //      metric_name{labelName=""}
      // So we can autocomplete the labelValue
      return this.autocompleteLabelValue(tree.parent, tree, pos, state);
    }
    if (
      tree.type.id === LabelMatcher &&
      tree.firstChild?.type.id === LabelName &&
      tree.lastChild?.type.id === 0 &&
      tree.lastChild?.firstChild === null // Discontinues completion in invalid cases like `foo{bar==<cursor>}`
    ) {
      // In this case the current token is not itself a valid match op yet:
      //      metric_name{labelName!}
      return this.arrayToCompletionResult([autocompleteNode.matchOp], tree.lastChild.start, pos);
    }
    if (tree.type.id === MatchOp || tree.parent?.type.id === MatchOp) {
      // In this case the current token is already a valid match op, but could be extended, e.g. "=" to "=~".
      return this.arrayToCompletionResult([autocompleteNode.matchOp], tree.start, pos);
    }
    if (tree.parent?.type.id === BinaryExpr) {
      return this.arrayToCompletionResult([autocompleteNode.binOp], tree.start, pos);
    }
    if (tree.parent?.type.id === FunctionIdentifier) {
      return this.arrayToCompletionResult([autocompleteNode.functionIdentifier], tree.start, pos);
    }
    if (tree.parent?.type.id === AggregateOp) {
      return this.arrayToCompletionResult([autocompleteNode.aggregateOp], tree.start, pos);
    }
    if ((tree.type.id === Identifier && tree.parent?.type.id === 0) || (tree.type.id === 0 && tree.parent?.type.id !== LabelMatchers)) {
      // This matches identifier-ish keywords in certain places where a normal identifier would be invalid, like completing "b" into "by":
      //        sum b
      // ...or:
      //        sum(metric_name) b
      // ...or completing "unle" into "unless":
      //        metric_name / unle
      // TODO: This is imprecise and autocompletes in too many situations. Make this better.
      return this.arrayToCompletionResult([autocompleteNode.aggregateOpModifier].concat(autocompleteNode.binOp), tree.start, pos);
    }
    return null;
  }

  private autocompleteLabelValue(parent: Subtree, current: Subtree, pos: number, state: EditorState): Promise<CompletionResult> | null {
    if (!this.prometheusClient) {
      return null;
    }
    // First get the labelName.
    // By definition it's the firstChild: https://github.com/promlabs/lezer-promql/blob/0ef65e196a8db6a989ff3877d57fd0447d70e971/src/promql.grammar#L250
    let labelName = '';
    if (this.prometheusClient && parent.firstChild && parent.firstChild.type.id === LabelName) {
      labelName = state.sliceDoc(parent.firstChild.start, parent.firstChild.end);
    }
    // then find the metricName if it exists
    const metricName = this.getMetricNameInVectorSelector(current, state);
    return this.prometheusClient.labelValues(labelName, metricName).then((labelValues: string[]) => {
      // +1 to avoid to remove the first quote.
      return this.arrayToCompletionResult(
        [
          {
            nodes: labelValues.map((value) => ({ label: value })),
            type: 'text',
          },
        ],
        current.start + 1,
        pos
      );
    });
  }

  private autocompleteLabelNamesByMetric(tree: Subtree, pos: number, state: EditorState): Promise<CompletionResult> | null {
    return this.labelNames(tree, pos, this.getMetricNameInVectorSelector(tree, state));
  }

  private getMetricNameInVectorSelector(tree: Subtree, state: EditorState): string {
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

  private labelNames(tree: Subtree, pos: number, metricName?: string): Promise<CompletionResult> | null {
    return !this.prometheusClient
      ? null
      : this.prometheusClient.labelNames(metricName).then((labelNames: string[]) => {
          // this case can happen when you are in empty bracket. Then you don't want to remove the first bracket
          return this.arrayToCompletionResult(
            [
              {
                nodes: labelNames.map((value) => ({ label: value })),
                type: 'constant',
              },
            ],
            tree.type.id === GroupingLabels || tree.type.id === LabelMatchers ? tree.start + 1 : tree.start,
            pos
          );
        });
  }

  private arrayToCompletionResult(data: AutoCompleteNodes[], from: number, to: number, includeSnippet = false): CompletionResult {
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
}
