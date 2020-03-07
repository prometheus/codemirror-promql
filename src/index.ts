import { defineMIME, defineMode, Mode } from "codemirror";
import { tokenBase } from "./promql";

defineMode('promql', function (config): Mode<any> {
  return {
    lineComment: '#',
    startState: function (): any {
      return {
        tokenize: [ tokenBase ],
      };
    },
    token: (stream, state) => {
      if (stream.eatSpace()) {
        return null;
      }
      return (state.tokenize[ state.tokenize.length - 1 ] || tokenBase)(stream, state);
    }
  } as Mode<any>
});

defineMIME('text/x-promql', 'promql');
