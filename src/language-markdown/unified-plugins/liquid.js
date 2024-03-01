import { markdownLineEnding } from "micromark-util-character";
import { codes, types } from "micromark-util-symbol";

import { dataNode } from "./utils.js";
// import { Code, Effects, State } from "micromark-util-types";

/**
 * @typedef {import('unified').Processor} Processor
 * @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
 * @typedef {import('mdast-util-from-markdown').Token} Token
 */

/**
 * @this {Processor}
 */
function remarkLiquid() {
  /** @type {any} */
  const data = this.data();

  (data.micromarkExtensions ??= []).push(syntax());
  (data.fromMarkdownExtensions ??= []).push(dataNode("liquidNode"));
}

function syntax() {
  return {
    text: {
      [codes.leftCurlyBrace]: {
        name: "liquid",
        tokenize: liquidTokenize,
      },
    },
  };

  function liquidTokenize(effects, ok, nok) {
    return start;

    function start(code) {
      effects.enter("liquidNode");
      effects.enter(types.data);
      effects.consume(code);
      return function (code) {
        switch (code) {
          case codes.percentSign:
          case codes.leftCurlyBrace:
            effects.consume(code);
            return inside;
          default:
            return nok;
        }
      };
    }

    function inside(code) {
      switch (code) {
        case codes.percentSign:
        case codes.rightCurlyBrace:
          effects.consume(code);
          return mayExit;
        case codes.eof:
          return nok;
        default:
          if (markdownLineEnding(code)) {
            effects.enter(types.lineEnding);
            effects.consume(code);
            effects.exit(types.lineEnding);
            return inside;
          }
          effects.consume(code);
          return inside;
      }
    }

    function mayExit(code) {
      if (code !== codes.rightCurlyBrace) {
        effects.consume(code);
        return inside;
      }
      effects.consume(code);
      effects.exit(types.data);
      effects.exit("liquidNode");
      return ok;
    }
  }
}

export { remarkLiquid };
