import { markdownLineEnding } from "micromark-util-character";
import { codes, types } from "micromark-util-symbol";

/**
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Token} Token
 * @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
 * @typedef {import('mdast-util-from-markdown').Handle} Handle
 * @typedef {import('micromark-util-types').State} State
 */

/**
 * @param {string} type
 * @returns {FromMarkdownExtension}
 */
function dataNode(type) {
  return {
    canContainEols: [type],
    enter: { [type]: enterInlineMath },
    exit: { [type]: exitInlineMath },
  };

  /** @type {Handle} */
  function enterInlineMath(token) {
    this.enter(
      // @ts-expect-error
      { type },
      token,
    );
    this.buffer();
  }

  /** @type {Handle} */
  function exitInlineMath(token) {
    const d = this.resume();
    /** @type {any} */
    const node = this.stack.at(-1);
    node.value = d;
    this.exit(token);
  }
}

/**
 * @this {import('unified').Processor}
 */
function remarkLiquid() {
  /** @type {any} */
  const data = this.data();

  (data.micromarkExtensions ??= []).push(syntax());
  (data.fromMarkdownExtensions ??= []).push(dataNode("liquidNode"));
}

/**
 * @returns {import('micromark-util-types').Extension}
 */
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

    /** @type {State} */
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

    /** @type {State} */
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

    /** @type {State} */
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

export default remarkLiquid;
