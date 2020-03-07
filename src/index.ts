import { defineMIME, defineMode, Mode } from "codemirror";
import { PromQLState, tokenBase } from "./promql";

defineMode('promql', function (config): Mode<PromQLState> {
  return {
    lineComment: '#',
    startState: function (): PromQLState {
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
