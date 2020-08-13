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

import axios from 'axios';

const apiPrefix = '/api/v1';
const labelsEndpoint = apiPrefix + '/labels';
const labelValuesEndpoint = apiPrefix + '/label/:name/values';
const seriesEndpoint = apiPrefix + '/series';

class Cache {
  // completeAssociation is the association between a metric name, a label name and the possible label values
  private completeAssociation: Map<string, Map<string, string[]>>;
  private labelValues: Map<string, string[]>;
  private labelNames: string[];

  constructor() {
    this.completeAssociation = new Map<string, Map<string, string[]>>();
    this.labelValues = new Map<string, string[]>();
    this.labelNames = [];
  }

  setAssociation(metricName: string, labelSet: Map<string, string>): void {
    let currentAssociation = this.completeAssociation.get(metricName);
    if (!currentAssociation) {
      currentAssociation = new Map<string, string[]>();
      this.completeAssociation.set(metricName, currentAssociation);
    }

    for (const [key, value] of Object.entries(labelSet)) {
      if (key === '__name__') {
        continue;
      }
      let labelValues = currentAssociation.get(key);
      if (!labelValues || labelValues.length === 0) {
        labelValues = [value];
      } else if (!labelValues.includes(value)) {
        labelValues.push(value);
      }
      currentAssociation.set(key, labelValues);
    }
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
      return labelValues ? labelValues : [];
    }
    return [];
  }
}

export interface PrometheusClient {
  labelNames(metricName?: string): Promise<string[]>;
  // labelValues return a list of the value associated to the given labelName.
  // In case a metric is provided, then the list of values is then associated to the couple <MetricName, LabelName>
  labelValues(labelName: string, metricName?: string): Promise<string[]>;
}

interface APIResponse {
  status: string;
  data: any;
  warnings: string[];
}

// HTTPPrometheusClient is the HTTP client that should be used to get some information from the different endpoint provided by prometheus.
export class HTTPPrometheusClient implements PrometheusClient {
  private readonly lookbackInterval = 60 * 60 * 1000 * 12; //12 hours
  private readonly url: string;
  private readonly cache: Cache;
  private readonly errorHandler?: (error: any) => void;

  constructor(url: string, errorHandler?: (error: any) => void, lookbackInterval?: number) {
    this.cache = new Cache();
    this.url = url;
    this.errorHandler = errorHandler;
    if (lookbackInterval) {
      this.lookbackInterval = lookbackInterval;
    }
  }

  labelNames(metricName?: string): Promise<string[]> {
    if (this.cache.getLabelNames(metricName) && this.cache.getLabelNames(metricName).length > 0) {
      return Promise.resolve(this.cache.getLabelNames(metricName));
    }

    const end = new Date();
    const start = new Date(end.getTime() - this.lookbackInterval);

    if (!metricName || metricName.length === 0) {
      return axios
        .get<APIResponse>(this.url + labelsEndpoint, {
          params: {
            start: start.toISOString(),
            end: end.toISOString(),
          },
        })
        .then((response) => {
          // In this case APIResponse.data already contains an array of string.
          // See https://prometheus.io/docs/prometheus/latest/querying/api/#getting-label-names
          if (response.data) {
            this.cache.setLabelNames(response.data.data);
            return response.data.data;
          }
          return [];
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
      return axios
        .get<APIResponse>(this.url + labelValuesEndpoint.replace(/:name/gi, labelName), {
          params: {
            start: start.toISOString(),
            end: end.toISOString(),
          },
        })
        .then((response) => {
          // In this case APIResponse.data already contains an array of string.
          // See https://prometheus.io/docs/prometheus/latest/querying/api/#querying-label-values
          if (response.data) {
            this.cache.setLabelValues(labelName, response.data.data);
            return response.data.data;
          }
          return [];
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

  private series(metricName: string, start: Date, end: Date): Promise<Map<string, string>[]> {
    return axios
      .get<APIResponse>(this.url + seriesEndpoint, {
        params: {
          start: start.toISOString(),
          end: end.toISOString(),
          'match[]': metricName,
        },
      })
      .then((response) => {
        if (!response.data) {
          return [];
        }
        // In this case, APIResponse.data contains an array of map.
        // See https://prometheus.io/docs/prometheus/latest/querying/api/#finding-series-by-label-matchers
        const data = response.data.data as Map<string, string>[];
        data.forEach((labelSet: Map<string, string>) => {
          this.cache.setAssociation(metricName, labelSet);
        });
        return data;
      })
      .catch((error) => {
        if (this.errorHandler) {
          this.errorHandler(error);
        }
        return [];
      });
  }
}
