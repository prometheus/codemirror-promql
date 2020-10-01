CodeMirror-promql
=================
[![CircleCI](https://circleci.com/gh/prometheus-community/codemirror-promql.svg?style=shield)](https://circleci.com/gh/prometheus-community/codemirror-promql) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![NPM version](https://img.shields.io/npm/v/codemirror-promql.svg)](https://www.npmjs.org/package/codemirror-promql)

## Overview
This project provides a mode for [CodeMirror Next](https://codemirror.net/6) that handles syntax highlighting, linting and autocompletion for the PromQL ([Prometheus Query Language](https://prometheus.io/docs/introduction/overview/)).

> Initially this code was in a private repository. It has been transferred to the `prometheus-community` organization (Thanks to [Julius Volz](https://github.com/juliusv) who helped us with that).
During the transfer, the repository and the package changed its name from `codemirror-mode-promql` to the current one: `codemirror-promql`.

### Status
This mode is **not** production ready. If you want to use it, you may encounter some issues.
API and usage of this mode can be deeply changed between two versions.

See the [Development](#development) section for more information on features and usage.

### Installation
This mode is available as an npm package:

```bash
npm install codemirror-promql
```

**Note:** You will have to manually install [CodeMirror Next](https://codemirror.net/6), as it is a peer dependency to this package.

### Playground
You can try out the latest release version of this mode on:

https://prometheus-community.github.io/codemirror-promql/

Here is a short preview of it looks like currently:

![final_highlight](https://user-images.githubusercontent.com/4548045/89693931-565f1f00-d910-11ea-8bcf-c8b37d6d3196.gif)

### RoadMap
A roadmap is available in the issue [#5](https://github.com/prometheus-community/codemirror-promql/issues/5).

## Usage
* The development [app](./src/app) can give you an example of how to use it with no TS Framework.
* [How to use it in an angular project](./examples/angular-promql/README.md)

## Contributions
Any contribution or suggestion would be really appreciated. Feel free to [file an issue](https://github.com/prometheus-community/codemirror-promql/issues) or [send a pull request](https://github.com/prometheus-community/codemirror-promql/pulls).

## Development
In case you want to contribute and change the code by yourself, run the following commands:

To install all dependencies:

```
npm install
```

To start the web server:

```
npm start
```

This should create a tab in your browser with the development app that contains CodeMirror Next with the PromQL plugin.

### Autocompletion

The autocompletion feature has 3 different modes, each requiring a different setup:

 * **lsp**: This mode requires starting a Prometheus server and the [promql-langserver](https://github.com/prometheus-community/promql-langserver) with the following configuration:
 ```yaml
prometheus_url: "http://localhost:9090"
rest_api_port: 8000
```
 * **prometheus**: This mode requires starting a Prometheus server listening on port 9090.
 * **offline**: This mode doesn't require anything.

 **Note:** To avoid CORS issues when testing LSP-based completion, the development web server running on port 8080 proxies LSP requests to the language server backend running on port 8000. Alternatively, if you decide to remove this proxying and want the browser to be able to speak to your LSP backend directly, start your browser with web security disabled.
 * Example for Google Chrome on Windows:
    * `<Win>` + `r`  and copy and paste `chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security`

### Linter

The linter feature has 2 different modes, each requiring a different setup:

 * **lsp**: This mode requires the same setup as described before
 * **offline**: This mode doesn't require anything
 
 **Note:** Changing the linter mode during runtime requires reloading CodeMirror entirely.
 The [app](./src/app/app.ts) can give you an idea of how to do it.

### Deploy to Github Pages
* `npm install -g angular-cli-ghpages`
* Change into the `examples/angular-promql` directory.
* `ng build --prod --base-href "https://prometheus-community.github.io/codemirror-promql/"`
* `ngh -d dist/angular-promql`

## License
[MIT](./LICENSE)
