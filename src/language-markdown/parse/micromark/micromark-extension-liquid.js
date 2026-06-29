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
    enter: { [nodeType]: enter },
    exit: { [nodeType]: exit },
  };

  /** @type {Handle} */
  function enter(token) {
    this.enter(
      // @ts-expect-error
      { type: nodeType },
      token,
    );
    this.buffer();
  }

  /** @type {Handle} */
  function exit(token) {
    const d = this.resume();
    /** @type {any} */
    const node = this.stack.at(-1);
    node.value = this.sliceSerialize(token);
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
        tokenize,
      },
    },
  };

  function tokenize(effects, ok, nok) {
    /** @type {typeof codes.rightCurlyBrace | typeof codes.percentSign} */
    let closingCode;

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
            closingCode =
              code === codes.percentSign
                ? codes.percentSign
                : codes.rightCurlyBrace;
            effects.consume(code);
            return inside;
          default:
            return nok(code);
        }
      };
    }

    /** @type {State} */
    function inside(code) {
      switch (code) {
        case closingCode:
          return effects.check({ tokenize: tokenizeClose }, close, data)(code);
        case codes.eof:
          return nok(code);
        default:
          if (markdownLineEnding(code)) {
            effects.exit(types.data);
            effects.enter(types.lineEnding);
            effects.consume(code);
            effects.exit(types.lineEnding);
            effects.enter(types.data);
            return inside;
          }
          return data(code);
      }
    }

    /** @type {State} */
    function data(code) {
      effects.consume(code);
      return inside;
    }

    function tokenizeClose(effects, ok, nok) {
      return startClose;

      /** @type {State} */
      function startClose(code) {
        switch (code) {
          case codes.percentSign:
          case codes.rightCurlyBrace:
            effects.consume(code);
            return endClose;
          default:
            return nok(code);
        }
      }

      /** @type {State} */
      function endClose(code) {
        if (code !== codes.rightCurlyBrace) {
          return nok(code);
        }
        effects.consume(code);
        return ok;
      }
    }

    /** @type {State} */
    function close(code) {
      effects.consume(code);
      return closeEnd;
    }

    /** @type {State} */
    function closeEnd(code) {
      effects.consume(code);
      effects.exit(types.data);
      effects.exit(nodeType);
      return ok;
    }
  }
}

export { liquidFromMarkdown, liquidSyntax };
