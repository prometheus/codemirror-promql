import { basicSetup, EditorState, EditorView } from "@codemirror/next/basic-setup";
import { promQL } from "../lang-promql";
import { oneDark } from "@codemirror/next/theme-one-dark";

new EditorView({
  state: EditorState.create({extensions: [ basicSetup, promQL(), oneDark ]}),
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  parent: document.querySelector("#editor")!
})
