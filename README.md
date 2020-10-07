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

The autocompletion feature has 2 different modes, each requiring a different setup:

 * **prometheus**: This mode requires starting a Prometheus server listening on port 9090.
 * **offline**: This mode doesn't require anything.

### Linter

The linter feature has only an offline mode that doesn't require any particular setup.

In case you are bothered by the linter, you can deactivate like that:

```typescript
const extension = new PromQLExtension().activateLinter(false)
```

### Deploy to Github Pages
* `npm install -g angular-cli-ghpages`
* Change into the `examples/angular-promql` directory.
* `ng build --prod --base-href "https://prometheus-community.github.io/codemirror-promql/"`
* `ngh -d dist/angular-promql`

## License
[MIT](./LICENSE)
