import {
  asciiDigit,
  markdownLineEnding,
  markdownSpace,
} from "micromark-util-character";
import { codes, types } from "micromark-util-symbol";
// import { Code, Effects, State } from "micromark-util-types";

/**
 * @typedef {import('unified').Processor} Processor
 * @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
 * @typedef {import('mdast-util-from-markdown').Token} Token
 * @typedef {import('micromark-util-types').Previous} Previous
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').Extension} MicromarkExtension
 */

/**
 * @this {Processor}
 */
function remarkSingleDollarMath() {
  /** @type {any} */
  const data = this.data();

  (data.micromarkExtensions ??= []).push(syntax());
  (data.fromMarkdownExtensions ??= []).push(fromMarkdown());
}

/** * @returns {MicromarkExtension} */
function syntax() {
  return {
    text: {
      [codes.dollarSign]: {
        name: "math-text",
        tokenize: mathTextTokenize,
        previous,
      },
    },
  };

  /** @type {Tokenizer} */
  function mathTextTokenize(effects, ok, nok) {
    return start;

    /** @type {State} */
    function start(code) {
      effects.enter("inlineMath");
      effects.enter(types.data);
      return open(code);
    }

    /** @type {State} */
    function open(code) {
      effects.consume(code);
      return afterOpen;
    }

    function afterOpen(code) {
      if (
        code === codes.dollarSign ||
        asciiDigit(code) ||
        markdownSpace(code)
      ) {
        return nok;
      }
      return inside(code);
    }

    /** @type {State} */
    function inside(code) {
      switch (code) {
        case codes.backslash:
          effects.consume(code);
          return escaped;
        case codes.dollarSign:
          effects.consume(code);
          return exit(code);
        case codes.eof:
          return nok;
        default:
          if (markdownSpace(code)) {
            effects.consume(code);
            return unclosable;
          }
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
    function escaped(code) {
      if (code === codes.eof || markdownLineEnding(code)) {
        return nok;
      }
      effects.consume(code);
      return inside;
    }

    /** @type {State} */
    function unclosable(code) {
      if (code === codes.dollarSign) {
        return nok;
      }
      return inside(code);
    }

    /** @type {State} */
    function exit(code) {
      effects.consume(code);
      effects.exit(types.data);
      effects.exit("inlineMath");
      return ok;
    }
  }
}

function fromMarkdown() {
  return {
    canContainEols: ["inlineMath"],
    enter: { inlineMath: enterInlineMath },
    exit: { inlineMath: exitInlineMath },
  };

  /**
   * @this {CompileContext}
   * @param {Token} token
   */
  function enterInlineMath(token) {
    this.enter({ type: "inlineMath" }, token);
    this.buffer();
  }

  /**
   * @this {CompileContext}
   * @param {Token} token
   */
  function exitInlineMath(token) {
    const d = this.resume();
    const node = this.stack.at(-1);
    node.value = d;
    this.exit(token);
  }
}

/**
 * @type {Previous}
 */
function previous(code) {
  return (
    code !== codes.dollarSign ||
    this.events.at(-1)?.[1].type === types.characterEscape
  );
}

export { remarkSingleDollarMath };
