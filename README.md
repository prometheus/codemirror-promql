CodeMirror-mode-promql
======================
[![CircleCI](https://circleci.com/gh/Nexucis/codemirror-mode-promql.svg?style=shield)](https://circleci.com/gh/Nexucis/codemirror-mode-promql) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

> a CodeMirror mode for the PromQL language

![sample](https://user-images.githubusercontent.com/4548045/76161611-478ff880-6135-11ea-8b73-a35be5f650a7.PNG)
> Samples coming from https://github.com/infinityworks/prometheus-example-queries

## Playground
https://nexucis.github.io/codemirror-mode-promql/

## Usage
* [How to use it in an angular project](./examples/angular-promql/README.md)

## Contributions
Any contribution or suggestion would be really appreciated. Feel free to use the Issue section or to send a pull request.

## Development
In case you want to contribute and change the code by yourself, an easy way to do it is to:
 * Copy all file in the folder **src** in the folder **example/angular-promql/src**
 * Modify the file main.ts and replace the line `import 'codemirror-mode-promql';` by `import './index.ts';`
 * Run `npm install` and `npm start` in the folder **example/angular-promql/src**
 
Once you modified the code of the lib, don't forget to report the changes in the tracked corresponding file :).

### Deploy to Github Page
* `npm install -g angular-cli-ghpages`
* go on examples/angular-promql
* `ng build --prod --base-href "https://nexucis.github.io/codemirror-mode-promql/"`
* `ngh -d dist/angular-promql`

## License
[MIT](./LICENSE)
