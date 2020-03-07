Angular PromQL
==============

This is an example of how to use the promQL mode for [CodeMirror](https://codemirror.net/) in an Angular Project.

Note: to integrate codeMirror in Angular, this project uses [ngx-codemirror](https://github.com/TypeCtrl/ngx-codemirror)

After importing the module "CodemirrorModule", you just have to import the lib in the main.ts:

```typescript
import 'nexucis/codemirror-mode-promql'
```

and then in your component: 

```html
<ngx-codemirror
  [(ngModel)]="content"
  [options]="{
    lineNumbers: true,
    theme: 'material',
    mode: 'promql'
  }"
></ngx-codemirror>
```

Note: Don't forget to import the codeMirror theme in your angular.json: 

```json
{
            "styles": [
              "src/styles.css",
              "./node_modules/codemirror/lib/codemirror.css",
              "./node_modules/codemirror/theme/material.css"
            ]
}
```
