// The MIT License (MIT)
//
// Copyright (c) 2020 The Prometheus Authors
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { basicSetup, EditorState, EditorView } from "@codemirror/next/basic-setup";
import { promQL, setComplete } from "../lang-promql";

function activateLSPAutocompletion(): void {
  setComplete({url: "http://localhost:8080", enableLSP: true})
}

function activateOfflineAutocompletion(): void {
  setComplete({url: "", enableLSP: false})
}


new EditorView({
  state: EditorState.create({extensions: [ basicSetup, promQL() ]}),
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  parent: document.querySelector("#editor")!
})

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion,@typescript-eslint/ban-ts-ignore
// @ts-ignore
document.getElementById("lsp").addEventListener("click", function () {
  activateLSPAutocompletion()
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion,@typescript-eslint/ban-ts-ignore
// @ts-ignore
document.getElementById("offline").addEventListener("click", function () {
  activateOfflineAutocompletion()
});
