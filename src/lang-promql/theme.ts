import { highlighter } from '@codemirror/next/highlight';

// promQLHighlightMaterialTheme is based on the material theme defined here:
// https://codemirror.net/theme/material.css
export const promQLHighlightMaterialTheme = highlighter({
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
