Angular PromQL
==============

This is an example of how to use the promQL mode for [CodeMirror Nex](https://codemirror.net/6/) in an Angular Project.

1. dependencies required (without all angular dependencies required):

```json
{
    "dependencies": {
       [...]
      "@codemirror/next": "^0.9.0",
      "@nexucis/codemirror-next-autocomplete": "^0.1.3",
      "codemirror-promql": "^0.4.1",
    },
}
```

Note: this mode required that you load the codemirror-next-autocomplete module. You won't be able to use the vanilla autocomplete module

2. In the component where you want to have CodeMirror, override the basic setup to be able to change the autocomplete module:

```typescript
import { Component, OnInit } from '@angular/core';
import { Extension } from '@codemirror/next/state';
import { lineNumbers } from '@codemirror/next/gutter';
import { highlightSpecialChars, keymap, multipleSelections } from '@codemirror/next/view';
import { foldGutter, foldKeymap } from '@codemirror/next/fold';
import { bracketMatching } from '@codemirror/next/matchbrackets';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/next/closebrackets';
import { rectangularSelection } from '@codemirror/next/rectangular-selection';
import { highlightActiveLine, highlightSelectionMatches } from '@codemirror/next/highlight-selection';
import { defaultKeymap } from '@codemirror/next/commands';
import { searchKeymap } from '@codemirror/next/search';
import { commentKeymap } from '@codemirror/next/comment';
import { gotoLineKeymap } from '@codemirror/next/goto-line';
import { lintKeymap } from '@codemirror/next/lint';
import { autocomplete, autocompleteKeymap } from '@nexucis/codemirror-next-autocomplete';
import { highlighter } from '@codemirror/next/highlight';

@Component({
  selector: 'my-root',
  templateUrl: './my.component.html',
  styleUrls: ['./my.component.css'],
})
export class MyComponent implements OnInit {

  private basicSetup: Extension = [
    lineNumbers(),
    highlightSpecialChars(),
    foldGutter(),
    multipleSelections(),
    bracketMatching(),
    closeBrackets(),
    // /!\ This method is coming from @nexucis/codemirror-next-autocomplete
    // and not from @codemirror/next/autocomplete.
    // also here you enable the highlight of the matching string of the autocomplete list.
    autocomplete({ matchPre: '<b style="color: brown">', matchPost: '</b>' }),
    rectangularSelection(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...foldKeymap,
      ...commentKeymap,
      ...gotoLineKeymap,
      ...autocompleteKeymap,
      ...lintKeymap,
    ]),
  ];
}
``` 

3. Create the PromQLExtension and setup your personal autocomplete configuration

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
import { EditorState, EditorView } from '@codemirror/next/basic-setup';
import { PromQLExtension } from 'codemirror-promql';
import { autocomplete, autocompleteKeymap, FilterType } from '@nexucis/codemirror-next-autocomplete';

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
        extensions: [this.basicSetup, promqlExtension.asExtension()],
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
