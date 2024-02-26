import {
  asciiAlpha,
  asciiDigit,
  asciiHexDigit,
} from "micromark-util-character";
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
function remarkEntity() {
  /** @type {any} */
  const data = this.data();

  (data.micromarkExtensions ??= []).push(syntax());
  (data.fromMarkdownExtensions ??= []).push(fromMarkdown());
}

function syntax() {
  return {
    text: {
      [codes.ampersand]: {
        name: "entity",
        tokenize,
      },
    },
  };

  /** @type {Tokenizer} */
  function tokenize(effects, ok, nok) {
    return start;

    function start(code) {
      effects.enter("entity");
      effects.enter(types.data);
      effects.consume(code);
      return afterStart;
    }

    function afterStart(code) {
      if (code === codes.numberSign) {
        effects.consume(code);
        return startNumber;
      }
      if (asciiAlpha(code)) {
        return insideAlpha(code);
      }
      return nok;
    }

    function startNumber(code) {
      if (asciiDigit(code)) {
        return insideDecimal(code);
      }

      if (code === codes.lowercaseX || code === codes.uppercaseX) {
        effects.consume(code);
        return insideHex;
      }

      return nok;
    }

    function insideDecimal(code) {
      if (asciiDigit(code)) {
        effects.consume(code);
        return insideDecimal;
      }

      if (code === codes.semicolon) {
        return exit(code);
      }

      return nok;
    }

    function insideHex(code) {
      if (asciiHexDigit(code)) {
        effects.consume(code);
        return insideHex;
      }

      if (code === codes.semicolon) {
        return exit(code);
      }

      return nok;
    }

    function insideAlpha(code) {
      if (asciiAlpha(code)) {
        effects.consume(code);
        return insideAlpha;
      }

      if (code === codes.semicolon) {
        return exit(code);
      }

      return nok;
    }

    function exit(code) {
      effects.consume(code);
      effects.exit(types.data);
      effects.exit("entity");
      return ok;
    }
  }
}

function fromMarkdown() {
  return {
    canContainEols: ["entity"],
    enter: { entity: enter },
    exit: { entity: exit },
  };

  /**
   * @this {CompileContext}
   * @param {Token} token
   */
  function enter(token) {
    this.enter({ type: "entity" }, token);
    this.buffer();
  }

  /**
   * @this {CompileContext}
   * @param {Token} token
   */
  function exit(token) {
    const d = this.resume();
    const node = this.stack.at(-1);
    node.value = d;
    this.exit(token);
  }
}

export { remarkEntity };
