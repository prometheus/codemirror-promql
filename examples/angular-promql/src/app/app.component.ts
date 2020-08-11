import { Component, OnInit } from '@angular/core';
import { EditorState, EditorView } from '@codemirror/next/basic-setup';
import { PromQLExtension } from 'codemirror-promql';
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
import { autocomplete, autocompleteKeymap, FilterType } from '@nexucis/codemirror-next-autocomplete';
import { highlighter } from '@codemirror/next/highlight';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  private basicSetup: Extension = [
    lineNumbers(),
    highlightSpecialChars(),
    foldGutter(),
    multipleSelections(),
    bracketMatching(),
    closeBrackets(),
    autocomplete({ filterType: FilterType.Fuzzy }),
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

  private promQLHighlightMaterialTheme = highlighter({
    deleted: { textDecoration: 'line-through' },
    inserted: { textDecoration: 'underline' },
    link: { textDecoration: 'underline' },
    strong: { fontWeight: 'bold' },
    emphasis: { fontStyle: 'italic' },
    invalid: { color: '#f00' },
    keyword: { color: '#C792EA' },
    operator: { color: '#89DDFF' },
    atom: { color: '#F78C6C' },
    number: { color: '#FF5370' },
    string: { color: '#99b867' },
    'regexp, escape': { color: '#e40' },
    'variableName definition': { color: '#f07178' },
    labelName: { color: '#f07178' },
    typeName: { color: '#085' },
    functionName: { color: '#C792EA' },
    'propertyName definition': { color: '#00c' },
    comment: { color: '#546E7A' },
    meta: { color: '#FFCB6B' },
  });

  ngOnInit(): void {
    const promqlExtension = new PromQLExtension();
    promqlExtension.setComplete({
      url: '',
      enableLSP: false,
      offline: true,
      hybrid: {
        fuzzyPre: '<b style="color: brown">',
        fuzzyPost: '</b>',
      },
    });
    // tslint:disable-next-line:no-unused-expression
    const view = new EditorView({
      state: EditorState.create({
        extensions: [this.basicSetup, promqlExtension.asExtension(), this.promQLHighlightMaterialTheme],
      }),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      // tslint:disable-next-line:no-non-null-assertion
      parent: document.getElementById('editor')!,
    });
  }
}
