import { basicSetup, EditorState, EditorView } from "@codemirror/next/basic-setup";
import { promQL } from "../lang-promql";

new EditorView({
  state: EditorState.create({extensions: [ basicSetup, promQL() ]}),
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  parent: document.querySelector("#editor")!
})
