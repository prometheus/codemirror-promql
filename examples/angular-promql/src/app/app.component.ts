import { Component, OnInit } from '@angular/core';
import { basicSetup, EditorState, EditorView } from '@codemirror/next/basic-setup';
import { PromQLExtension } from 'codemirror-promql';
import { highlighter } from '@codemirror/next/highlight';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
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

  private customTheme = EditorView.theme({
    $completionDetail: {
      marginLeft: '0.5em',
      float: 'right',
      color: '#9d4040',
    },
    $completionMatchedText: {
      color: '#83080a',
      textDecoration: 'none',
      fontWeight: 'bold',
    },
  });

  ngOnInit(): void {
    const promqlExtension = new PromQLExtension();
    // tslint:disable-next-line:no-unused-expression
    const view = new EditorView({
      state: EditorState.create({
        extensions: [basicSetup, promqlExtension.asExtension(), this.promQLHighlightMaterialTheme, this.customTheme],
      }),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      // tslint:disable-next-line:no-non-null-assertion
      parent: document.getElementById('editor')!,
    });
  }
}
