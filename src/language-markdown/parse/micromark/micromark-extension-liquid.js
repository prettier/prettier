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
  return {
    flow: {
      [codes.leftCurlyBrace]: {
        name: "liquidFlow",
        tokenize: tokenizeFlow,
      },
    },
    text: {
      [codes.leftCurlyBrace]: {
        name: "liquidText",
        tokenize: tokenizeText,
      },
    },
  };

  /** @this {TokenizeContext} */
  function tokenizeFlow(effects, ok, nok) {
    return tokenize.call(this, effects, ok, nok, "flow");
  }

  /** @this {TokenizeContext} */
  function tokenizeText(effects, ok, nok) {
    return tokenize.call(this, effects, ok, nok, "text");
  }

  /**
   * @this {TokenizeContext}
   * @param mode {"text" | "flow"}
   */
  function tokenize(effects, ok, nok, mode) {
    const isFlow = mode === "flow";
    const { interrupt, now, parser } = this;
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
            effects.enter(types.lineEnding);
            effects.consume(code);
            effects.exit(types.lineEnding);
            if (isFlow) {
              return afterLineEnding;
            }
            effects.enter(types.data);
            return inside;
          }
          effects.consume(code);
          return inside;
      }
    }

    /** @type {State} */
    function afterLineEnding(code) {
      if (parser.lazy[now().line]) {
        return nok(code);
      }

      if (markdownLineEnding(code)) {
        effects.enter(types.lineEnding);
        effects.consume(code);
        effects.exit(types.lineEnding);
        return afterLineEnding;
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

export { liquidFromMarkdown, liquidSyntax };
