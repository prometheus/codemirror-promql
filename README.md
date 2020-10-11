CodeMirror-promql
=================
[![CircleCI](https://circleci.com/gh/prometheus-community/codemirror-promql.svg?style=shield)](https://circleci.com/gh/prometheus-community/codemirror-promql) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![NPM version](https://img.shields.io/npm/v/codemirror-promql.svg)](https://www.npmjs.org/package/codemirror-promql)

## Overview
This project provides a mode for [CodeMirror Next](https://codemirror.net/6) that handles syntax highlighting, linting and autocompletion for the PromQL ([Prometheus Query Language](https://prometheus.io/docs/introduction/overview/)).

> Initially this code was in a private repository. It has been transferred to the `prometheus-community` organization (Thanks to [Julius Volz](https://github.com/juliusv) who helped us with that).
During the transfer, the repository and the package changed its name from `codemirror-mode-promql` to the current one: `codemirror-promql`.

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

![preview](https://user-images.githubusercontent.com/4548045/95660829-d5e4b680-0b2a-11eb-9ecb-41dca6396273.gif)

### RoadMap
A roadmap is available in the issue [#5](https://github.com/prometheus-community/codemirror-promql/issues/5).

## Usage

As the setup of the PromQL language can a bit tricky in CMN, this lib provides a class `PromQLExtension` 
which is here to help you to configure the different extensions we aim to provide.

### Default setup
If you want to enjoy about the different features provided without taking too much time to understand how to configure them,
then the easiest way is this one:

```typescript
import { PromQLExtension } from 'codemirror-promql';
import { basicSetup, EditorState, EditorView } from '@codemirror/next/basic-setup';

const promQL = new PromQLExtension()
new EditorView({
  state: EditorState.create({
    extensions: [basicSetup, promQL.asExtension()],
  }),
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  // tslint:disable-next-line:no-non-null-assertion
  parent: document.getElementById('editor')!,
});
```

Using the default setup will activate:
* syntax highlighting
* an offline autocompletion that will suggest PromQL keywords such as functions / aggregations, depending on the context.
* an offline linter that will display PromQL syntax errors (which is closer to what Prometheus returns)

### Deactivate autocompletion - linter
In case you would like to deactivate the linter and/or the autocompletion it's simple as that:

```typescript
const promQL = new PromQLExtension().activateLinter(false).activateCompletion(false) // here the linter and the autocomplete are deactivated
```

### Connect the autocompletion extension to a remote Prometheus server
Connecting the autocompletion extension to a remote Prometheus server will provide autocompletion of metric names, label names, and label values.

#### Use the default Prometheus client

##### Prometheus URL
If you want to use the default Prometheus client provided by this lib, you have to provide the url used to contact the Prometheus server.

```typescript
const promQL = new PromQLExtension().setComplete({url: 'https://prometheus.land'})
```

##### Override FetchFn
In case your Prometheus server is protected and requires a special HTTP client, you can override the function `fetchFn` that is used to perform any required HTTP request.

```typescript
const promQL = new PromQLExtension().setComplete({fetchFn: myHTTPClient})
```

##### Error Handling
You can set up your own error handler to catch any HTTP error that can occur when the PrometheusClient is contacting Prometheus.

```typescript
const promQL = new PromQLExtension().setComplete({httpErrorHandler: (error:any) => console.error(error)})
```

#### Override the default Prometheus client
In case you are not satisfied by our default Prometheus client, you can still provide your own. 
It has to implement the interface [PrometheusClient](https://github.com/prometheus-community/codemirror-promql/blob/master/src/lang-promql/client/prometheus.ts#L111-L117).

```typescript
const promQL = new PromQLExtension().setComplete({prometheusClient: MyPrometheusClient})
```

### Example

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
