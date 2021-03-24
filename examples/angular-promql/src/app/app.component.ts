import { Component, OnInit } from '@angular/core';
import { PromQLExtension } from 'codemirror-promql';
import { HighlightStyle, tags } from '@codemirror/highlight';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { basicSetup } from '@codemirror/basic-setup';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  // promQLHighlightMaterialTheme is based on the material theme defined here:
  // https://codemirror.net/theme/material.css
  private static promQLHighlightMaterialTheme = HighlightStyle.define([
    {
      tag: tags.deleted,
      textDecoration: 'line-through',
    },
    {
      tag: tags.inserted,
      textDecoration: 'underline',
    },
    {
      tag: tags.link,
      textDecoration: 'underline',
    },
    {
      tag: tags.strong,
      fontWeight: 'bold',
    },
    {
      tag: tags.emphasis,
      fontStyle: 'italic',
    },
    {
      tag: tags.invalid,
      color: '#f00',
    },
    {
      tag: tags.keyword,
      color: '#C792EA',
    },
    {
      tag: tags.operator,
      color: '#89DDFF',
    },
    {
      tag: tags.atom,
      color: '#F78C6C',
    },
    {
      tag: tags.number,
      color: '#FF5370',
    },
    {
      tag: tags.string,
      color: '#99b867',
    },
    {
      tag: [tags.escape, tags.regexp],
      color: '#e40',
    },
    {
      tag: tags.definition(tags.variableName),
      color: '#f07178',
    },
    {
      tag: tags.labelName,
      color: '#f07178',
    },
    {
      tag: tags.typeName,
      color: '#085',
    },
    {
      tag: tags.function(tags.variableName),
      color: '#C792EA',
    },
    {
      tag: tags.definition(tags.propertyName),
      color: '#00c',
    },
    {
      tag: tags.comment,
      color: '#546e7a',
    },
  ]);

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
        extensions: [basicSetup, promqlExtension.asExtension(), AppComponent.promQLHighlightMaterialTheme, this.customTheme],
      }),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      // tslint:disable-next-line:no-non-null-assertion
      parent: document.getElementById('editor')!,
    });
  }
}
