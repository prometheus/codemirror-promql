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

import { FetchFn } from '.';

const apiPrefix = '/api/v1';
const labelsEndpoint = apiPrefix + '/labels';
const labelValuesEndpoint = apiPrefix + '/label/:name/values';
const seriesEndpoint = apiPrefix + '/series';
const metricMetadataEndpoint = apiPrefix + '/metadata';

export interface MetricMetadata {
  type: string;
  help: string;
}

class Cache {
  // completeAssociation is the association between a metric name, a label name and the possible label values
  private completeAssociation: Map<string, Map<string, Set<string>>>;
  // metricMetadata is the association between a metric name and the associated metadata
  private readonly metricMetadata: Map<string, MetricMetadata[]>;
  private labelValues: Map<string, string[]>;
  private labelNames: string[];

  constructor() {
    this.completeAssociation = new Map<string, Map<string, Set<string>>>();
    this.metricMetadata = new Map<string, MetricMetadata[]>();
    this.labelValues = new Map<string, string[]>();
    this.labelNames = [];
  }

  setAssociation(metricName: string, labelSet: Map<string, string>): void {
    let currentAssociation = this.completeAssociation.get(metricName);
    if (!currentAssociation) {
      currentAssociation = new Map<string, Set<string>>();
      this.completeAssociation.set(metricName, currentAssociation);
    }

    for (const [key, value] of Object.entries(labelSet)) {
      if (key === '__name__') {
        continue;
      }
      const labelValues = currentAssociation.get(key);
      if (labelValues === undefined) {
        currentAssociation.set(
          key,
          new Set<string>([value])
        );
      } else {
        labelValues.add(value);
      }
    }
  }

  setMetricMetadata(metricName: string, metadata: MetricMetadata[]): void {
    this.metricMetadata.set(metricName, metadata);
  }

  getMetricMetadata(): Map<string, MetricMetadata[]> {
    return this.metricMetadata;
  }

  setLabelNames(labelNames: string[]): void {
    this.labelNames = labelNames;
  }

  getLabelNames(metricName?: string): string[] {
    if (!metricName || metricName.length === 0) {
      return this.labelNames;
    }
    const labelSet = this.completeAssociation.get(metricName);
    return labelSet ? Array.from(labelSet.keys()) : [];
  }

  setLabelValues(labelName: string, labelValues: string[]): void {
    this.labelValues.set(labelName, labelValues);
  }

  getLabelValues(labelName: string, metricName?: string): string[] {
    if (!metricName || metricName.length === 0) {
      const result = this.labelValues.get(labelName);
      return result ? result : [];
    }

    const labelSet = this.completeAssociation.get(metricName);
    if (labelSet) {
      const labelValues = labelSet.get(labelName);
      return labelValues ? Array.from(labelValues) : [];
    }
    return [];
  }
}

export interface PrometheusClient {
  labelNames(metricName?: string): Promise<string[]>;
  // labelValues return a list of the value associated to the given labelName.
  // In case a metric is provided, then the list of values is then associated to the couple <MetricName, LabelName>
  labelValues(labelName: string, metricName?: string): Promise<string[]>;
  metricMetadata(): Promise<Map<string, MetricMetadata[]>>;
}

interface APIResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
  warnings?: string[];
}

// These are status codes where the Prometheus API still returns a valid JSON body,
// with an error encoded within the JSON.
const badRequest = 400;
const unprocessableEntity = 422;
const serviceUnavailable = 503;

// HTTPPrometheusClient is the HTTP client that should be used to get some information from the different endpoint provided by prometheus.
export class HTTPPrometheusClient implements PrometheusClient {
  private readonly lookbackInterval = 60 * 60 * 1000 * 12; //12 hours
  private readonly url: string;
  private readonly cache: Cache;
  private readonly errorHandler?: (error: any) => void;
  // For some reason, just assigning via "= fetch" here does not end up executing fetch correctly
  // when calling it, thus the indirection via another function wrapper.
  private readonly fetchFn: FetchFn = (input: RequestInfo, init?: RequestInit): Promise<Response> => fetch(input, init);

  constructor(url: string, errorHandler?: (error: any) => void, lookbackInterval?: number, fetchFn?: FetchFn) {
    this.cache = new Cache();
    this.url = url;
    this.errorHandler = errorHandler;
    if (lookbackInterval) {
      this.lookbackInterval = lookbackInterval;
    }
    if (fetchFn) {
      this.fetchFn = fetchFn;
    }
  }

  labelNames(metricName?: string): Promise<string[]> {
    if (this.cache.getLabelNames(metricName) && this.cache.getLabelNames(metricName).length > 0) {
      return Promise.resolve(this.cache.getLabelNames(metricName));
    }

    const end = new Date();
    const start = new Date(end.getTime() - this.lookbackInterval);
    if (metricName === undefined || metricName === '') {
      const params: URLSearchParams = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
      });
      // See https://prometheus.io/docs/prometheus/latest/querying/api/#getting-label-names
      return this.fetchAPI<string[]>(`${labelsEndpoint}?${params}`)
        .then((labelNames) => {
          this.cache.setLabelNames(labelNames);
          return labelNames;
        })
        .catch((error) => {
          if (this.errorHandler) {
            this.errorHandler(error);
          }
          return [];
        });
    }

    return this.series(metricName, start, end).then((_) => {
      return this.cache.getLabelNames(metricName);
    });
  }

  // labelValues return a list of the value associated to the given labelName.
  // In case a metric is provided, then the list of values is then associated to the couple <MetricName, LabelName>
  labelValues(labelName: string, metricName?: string): Promise<string[]> {
    if (this.cache.getLabelValues(labelName, metricName) && this.cache.getLabelValues(labelName, metricName).length > 0) {
      return Promise.resolve(this.cache.getLabelValues(labelName, metricName));
    }
    const end = new Date();
    const start = new Date(end.getTime() - this.lookbackInterval);

    if (!metricName || metricName.length === 0) {
      const params: URLSearchParams = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
      });
      // See https://prometheus.io/docs/prometheus/latest/querying/api/#querying-label-values
      return this.fetchAPI<string[]>(`${labelValuesEndpoint.replace(/:name/gi, labelName)}?${params}`)
        .then((labelValues) => {
          this.cache.setLabelValues(labelName, labelValues);
          return labelValues;
        })
        .catch((error) => {
          if (this.errorHandler) {
            this.errorHandler(error);
          }
          return [];
        });
    }

    return this.series(metricName, start, end).then((_) => {
      return this.cache.getLabelValues(labelName, metricName);
    });
  }

  metricMetadata(): Promise<Map<string, MetricMetadata[]>> {
    if (this.cache.getMetricMetadata() && this.cache.getMetricMetadata().size > 0) {
      return Promise.resolve(this.cache.getMetricMetadata());
    }

    return this.fetchAPI<Map<string, MetricMetadata[]>>(metricMetadataEndpoint)
      .then((metadata) => {
        for (const [key, value] of Object.entries(metadata)) {
          this.cache.setMetricMetadata(key, value);
        }
        return this.cache.getMetricMetadata();
      })
      .catch((error) => {
        if (this.errorHandler) {
          this.errorHandler(error);
        }
        return new Map<string, MetricMetadata[]>();
      });
  }

  private series(metricName: string, start: Date, end: Date): Promise<Map<string, string>[]> {
    const params: URLSearchParams = new URLSearchParams({
      start: start.toISOString(),
      end: end.toISOString(),
      'match[]': metricName,
    });
    // See https://prometheus.io/docs/prometheus/latest/querying/api/#finding-series-by-label-matchers
    return this.fetchAPI<Map<string, string>[]>(`${seriesEndpoint}?${params}`)
      .then((series) => {
        series.forEach((labelSet: Map<string, string>) => {
          this.cache.setAssociation(metricName, labelSet);
        });
        return series;
      })
      .catch((error) => {
        if (this.errorHandler) {
          this.errorHandler(error);
        }
        return [];
      });
  }

  private fetchAPI<T>(resource: string): Promise<T> {
    return this.fetchFn(this.url + resource)
      .then((res) => {
        if (!res.ok && ![badRequest, unprocessableEntity, serviceUnavailable].includes(res.status)) {
          throw new Error(res.statusText);
        }
        return res;
      })
      .then((res) => res.json())
      .then((apiRes: APIResponse<T>) => {
        if (apiRes.status === 'error') {
          throw new Error(apiRes.error !== undefined ? apiRes.error : 'missing "error" field in response JSON');
        }
        if (apiRes.data === undefined) {
          throw new Error('missing "data" field in response JSON');
        }
        return apiRes.data;
      });
  }
}
