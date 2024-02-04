import { markdownLineEnding } from "micromark-util-character";
import { codes, types } from "micromark-util-symbol";
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
  (data.fromMarkdownExtensions ??= []).push(fromMarkdown());
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
      effects.enter("liquid");
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
      effects.exit("liquid");
      return ok;
    }
  }
}

function fromMarkdown() {
  return {
    canContainEols: ["liquid"],
    enter: { liquid: enterLiquid },
    exit: { liquid: exitLiquid },
  };

  /**
   * @this {CompileContext}
   * @param {Token} token
   */
  function enterLiquid(token) {
    this.enter({ type: "liquidNode" }, token);
    this.buffer();
  }

  /**
   * @this {CompileContext}
   * @param {Token} token
   */
  function exitLiquid(token) {
    const d = this.resume();
    const node = this.stack.at(-1);
    node.value = d;
    this.exit(token);
  }
}

export { remarkLiquid };
