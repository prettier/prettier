import { markdownLineEnding, markdownSpace } from "micromark-util-character";
import { codes, types } from "micromark-util-symbol";

/**
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Token} Token
 * @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
 * @typedef {import('mdast-util-from-markdown').Handle} Handle
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
 */

const nodeType = "liquidNode";
const nonLazyContinuation = {
  tokenize: tokenizeNonLazyContinuation,
  partial: true,
};

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
    this.resume();
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
  const liquid = {
    name: "liquid",
    tokenize,
  };

  return {
    flow: {
      [codes.leftCurlyBrace]: {
        name: "liquidFlow",
        tokenize: tokenizeFlow,
      },
    },
    text: {
      [codes.leftCurlyBrace]: liquid,
    },
  };

  /** @this {TokenizeContext} */
  function tokenizeFlow(effects, ok, nok) {
    return tokenizeLiquid(effects, ok, nok, true, this.interrupt);
  }

  function tokenize(effects, ok, nok) {
    return tokenizeLiquid(effects, ok, nok, false, false);
  }

  function tokenizeLiquid(effects, ok, nok, isFlow, interrupt) {
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
            return isFlow && interrupt ? ok : inside;
          default:
            return nok(code);
        }
      };
    }

    /** @type {State} */
    function inside(code) {
      switch (code) {
        case closingCode:
          effects.consume(code);
          return mayClose;
        case codes.eof:
          return nok(code);
        default:
          if (markdownLineEnding(code)) {
            effects.exit(types.data);
            if (isFlow) {
              return effects.attempt(
                nonLazyContinuation,
                afterLineEnding,
                nok,
              )(code);
            }
            effects.enter(types.lineEnding);
            effects.consume(code);
            effects.exit(types.lineEnding);
            effects.enter(types.data);
            return inside;
          }
          effects.consume(code);
          return inside;
      }
    }

    /** @type {State} */
    function afterLineEnding(code) {
      if (markdownLineEnding(code)) {
        return effects.attempt(nonLazyContinuation, afterLineEnding, nok)(code);
      }

      effects.enter(types.data);
      return inside(code);
    }

    /** @type {State} */
    function mayClose(code) {
      if (code === codes.rightCurlyBrace) {
        effects.consume(code);
        effects.exit(types.data);
        effects.exit(nodeType);
        return isFlow ? afterClose : ok;
      }

      return inside;
    }

    /** @type {State} */
    function afterClose(code) {
      if (markdownSpace(code)) {
        effects.enter(types.whitespace);
        effects.consume(code);
        return afterWhitespace;
      }

      return after(code);
    }

    /** @type {State} */
    function afterWhitespace(code) {
      if (markdownSpace(code)) {
        effects.consume(code);
        return afterWhitespace;
      }

      effects.exit(types.whitespace);
      return after(code);
    }

    /** @type {State} */
    function after(code) {
      return code === codes.eof || markdownLineEnding(code)
        ? ok(code)
        : nok(code);
    }
  }
}

/** @this {TokenizeContext} */
function tokenizeNonLazyContinuation(effects, ok, nok) {
  const { now, parser } = this;
  return start;

  /** @type {State} */
  function start(code) {
    if (code === codes.eof) {
      return ok(code);
    }

    effects.enter(types.lineEnding);
    effects.consume(code);
    effects.exit(types.lineEnding);
    return lineStart;
  }

  /** @type {State} */
  function lineStart(code) {
    return parser.lazy[now().line] ? nok(code) : ok(code);
  }
}

export { liquidFromMarkdown, liquidSyntax };
