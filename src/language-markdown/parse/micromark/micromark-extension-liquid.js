import { markdownLineEnding } from "micromark-util-character";
import { codes, types } from "micromark-util-symbol";

/**
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Token} Token
 * @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
 * @typedef {import('mdast-util-from-markdown').Handle} Handle
 * @typedef {import('micromark-util-types').State} State
 */

const nodeType = "liquidNode";

/**
 * @returns {FromMarkdownExtension}
 */
function liquidFromMarkdown() {
  return {
    canContainEols: [nodeType],
    enter: { [nodeType]: enterInlineLiquid },
    exit: { [nodeType]: exitInlineLiquid },
  };

  /** @type {Handle} */
  function enterInlineLiquid(token) {
    this.enter(
      // @ts-expect-error
      { type: nodeType },
      token,
    );
    this.buffer();
  }

  /** @type {Handle} */
  function exitInlineLiquid(token) {
    const d = this.resume();
    /** @type {any} */
    const node = this.stack.at(-1);
    node.value = d;
    this.exit(token);
  }
}

/**
 * @returns {import('micromark-util-types').Extension}
 */
function liquidSyntax() {
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
        if (markdownLineEnding(code)) {
          effects.enter(types.lineEnding);
          effects.consume(code);
          effects.exit(types.lineEnding);
          return inside;
        }
        effects.consume(code);
        return inside;
      }
      effects.consume(code);
      effects.exit(types.data);
      effects.exit(nodeType);
      return ok;
    }
  }
}

export { liquidFromMarkdown, liquidSyntax };
