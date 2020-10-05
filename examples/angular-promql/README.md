Angular PromQL
==============

This is an example of how to use the promQL mode for [CodeMirror Nex](https://codemirror.net/6/) in an Angular Project.

1. dependencies required (without all angular dependencies required):

```json
{
    "dependencies": {
       [...]
      "@codemirror/next": "^0.13.0",
      "codemirror-promql": "^0.9.0",
    },
}
```

2. Create the PromQLExtension and setup your personal autocomplete configuration

```typescript
import { PromQLExtension } from 'codemirror-promql';

@Component({
  selector: 'my-root',
  templateUrl: './my.component.html',
  styleUrls: ['./my.component.css'],
})
export class MyComponent implements OnInit {
  ngOnInit(): void {
   // For this example, you activate the autocomplete mode 'offline' 
    const promqlExtension = new PromQLExtension();
  }
}
```

4. Inject the PromQLExtension in Codemirror

```typescript
import { Component, OnInit } from '@angular/core';
import { basicSetup, EditorState, EditorView } from '@codemirror/next/basic-setup';
import { PromQLExtension } from 'codemirror-promql';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  ngOnInit(): void {
    const promqlExtension = new PromQLExtension();
    // tslint:disable-next-line:no-unused-expression
    const view = new EditorView({
      state: EditorState.create({
        extensions: [basicSetup, promqlExtension.asExtension()],
      }),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      // tslint:disable-next-line:no-non-null-assertion
      parent: document.getElementById('editor')!,
    });
  }
}
```

With the following html file:

```html
<div id=editor></div>
```
