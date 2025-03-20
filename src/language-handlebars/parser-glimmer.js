import { preprocess as parseGlimmer } from "@glimmer/syntax";
import createError from "../common/parser-create-error.js";
import { locEnd, locStart } from "./loc.js";

/* from the following template: `non-escaped mustache \\{{helper}}`
 * glimmer parser will produce an AST missing a backslash
 * so here we add it back
 * */
function addBackslash(node) {
  const childrenOrBody = node.children ?? node.body;
  if (childrenOrBody) {
    for (let i = 0; i < childrenOrBody.length - 1; i++) {
      if (
        childrenOrBody[i].type === "TextNode" &&
        childrenOrBody[i + 1].type === "MustacheStatement"
      ) {
        childrenOrBody[i].chars = childrenOrBody[i].chars.replace(
          /\\$/u,
          "\\\\",
        );
      }
    }
  }
}

const isIndex = (value) => Number.isInteger(value) && value >= 0;
// Add `offset` to `loc.{start,end}`
const setOffset = (node) => {
  const { start, end } = node.loc;

  start.offset = node.loc.getStart().offset;
  end.offset = node.loc.getEnd().offset;

  /* c8 ignore next 6 */
  if (
    process.env.NODE_ENV !== "production" &&
    (!isIndex(start.offset) || !isIndex(end.offset))
  ) {
    throw new TypeError("Can't not locate node.");
  }
};

// Combine plugins to reduce traverse https://github.com/glimmerjs/glimmer-vm/blob/cdfb8f93d7ff0b504c8e9eab293f656a9b942025/packages/%40glimmer/syntax/lib/parser/tokenizer-event-handlers.ts#L442-L451
const glimmerPrettierParsePlugin = (/* options*/) => ({
  name: "glimmerPrettierParsePlugin",
  visitor: {
    All(node) {
      setOffset(node);
      addBackslash(node);
    },
  },
});

/** @type {import("@glimmer/syntax").PreprocessOptions} */
const glimmerParseOptions = {
  mode: "codemod",
  plugins: { ast: [glimmerPrettierParsePlugin] },
};

function parse(text /*, options */) {
  let ast;
  try {
    ast = parseGlimmer(text, glimmerParseOptions);
  } catch (error) {
    const location = getErrorLocation(error);

    if (location) {
      const message = getErrorMessage(error);

      throw createError(message, { loc: location, cause: error });
    }

    /* c8 ignore next */
    throw error;
  }

  return ast;
}

function getErrorMessage(error) {
  const { message } = error;
  const lines = message.split("\n");

  /*
  This kind of errors are like:

  ```
  Parse error on line 2:
  <A >x, {{@name}
  --------------^
  Expecting ...
  ```
  */
  if (
    lines.length >= 4 &&
    /^Parse error on line \d+:$/u.test(lines[0]) &&
    /^-*\^$/u.test(lines.at(-2))
  ) {
    return lines.at(-1);
  }

  /*
  This kind of errors are like:

  ```
  Unclosed element \`@name\`:

  |
  |  <{@name>
  |

  (error occurred in 'an unknown module' @ line 3 : column 0)
  ```
  */
  if (
    lines.length >= 4 &&
    /:\s?$/u.test(lines[0]) &&
    /^\(error occurred in '.*?' @ line \d+ : column \d+\)$/u.test(
      lines.at(-1),
    ) &&
    lines[1] === "" &&
    lines.at(-2) === "" &&
    lines.slice(2, -2).every((line) => line.startsWith("|"))
  ) {
    return lines[0].trim().slice(0, -1);
  }

  /* c8 ignore next */
  return message;
}

function getErrorLocation(error) {
  const { location, hash } = error;
  if (location) {
    const { start, end } = location;
    if (typeof end.line !== "number") {
      return { start };
    }
    return location;
  }

  if (hash) {
    const {
      loc: { last_line, last_column },
    } = hash;
    return { start: { line: last_line, column: last_column + 1 } };
  }
}

export const glimmer = {
  parse,
  astFormat: "glimmer",
  locStart,
  locEnd,
};
