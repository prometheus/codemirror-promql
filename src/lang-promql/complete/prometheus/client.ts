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

interface APIResponse {
  status: string;
  data: any;
  warnings: string[];
}

// LSPClient is the HTTP client that should be used to get some information from the different endpoint provided by langserver-promql.
// TODO integrate a cache
export class PrometheusClient {
  private readonly url: string
  private readonly apiPrefix = "/api/v1"
  private readonly labelsEndpoint = this.apiPrefix + "/labels"
  private readonly seriesEndpoint = this.apiPrefix + "/series"

  constructor(url: string) {
    this.url = url;
  }

  labelNames(metricName?: string): Promise<string[]> {
    const end = new Date();
    const offset = (60 * 60 * 1000) * 12; //12 hours
    const start = new Date()
    start.setTime(start.getTime() - offset)

    if (!metricName || metricName.length === 0) {
      return axios.get<APIResponse>(this.url + this.labelsEndpoint, {
        params: {
          "start": start.toISOString(),
          "end": end.toISOString(),
        }
      }).then((response) => {
        // In that case APIResponse.data already contain an array of string.
        // See https://prometheus.io/docs/prometheus/latest/querying/api/#getting-label-names
        return response.data ? response.data.data : []
      })
    }

    return axios.get<APIResponse>(this.url + this.seriesEndpoint, {
      params: {
        "start": start.toISOString(),
        "end": end.toISOString(),
        "match[]": metricName,
      }
    }).then((response) => {
      if (!response.data) {
        return []
      }
      // In that case, APIResponse.data contain an array of map.
      // So we have to convert the data and we have to remove the potential duplicate labelName.
      // See https://prometheus.io/docs/prometheus/latest/querying/api/#finding-series-by-label-matchers
      const data = response.data.data as Map<string, string>[]
      const result: string[] = []
      const subResult = new Map<string, boolean>()

      data.forEach((labelSet: Map<string, string>) => {
        for (const labelName of Object.keys(labelSet)) {
          // Using the intermediate map will remove all duplicate LabelName.
          subResult.set(labelName, true)
        }
      })
      for (const labelName of subResult.keys()) {
        result.push(labelName)
      }
      return result
    })
  }
}