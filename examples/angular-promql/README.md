Angular PromQL
==============

This is an example of how to use the promQL mode for [CodeMirror](https://codemirror.net/) in an Angular Project.

Note: to integrate codeMirror in Angular, this project uses [ngx-codemirror](https://github.com/TypeCtrl/ngx-codemirror)

After importing the module "CodemirrorModule", you just have to import the lib in the main.ts:

```typescript
import 'codemirror-promql'
```

and then in your component: 

```html
<ngx-codemirror
  [(ngModel)]="content"
  [options]="{
    lineNumbers: true,
    theme: 'material',
    mode: 'promql'
    lint: true,
    matching: true,
    extraKeys: {'Ctrl-Space': 'promQLAutoCompletion'},
    foldGutter: true,
    gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter']
  }"
></ngx-codemirror>
```

Note: Don't forget to import the codeMirror theme in your angular.json: 

```json
{
            "styles": [
              "src/styles.css",
              "./node_modules/codemirror/lib/codemirror.css",
              "./node_modules/codemirror/theme/material.css",
              "./node_modules/codemirror/addon/fold/foldgutter.css",
              "./node_modules/codemirror/addon/hint/show-hint.css",
              "./node_modules/codemirror/addon/lint/lint.css"
            ]
}
```
