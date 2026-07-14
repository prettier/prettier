import indexToPosition from "index-to-position";
import { parse as yukuParse } from "yuku-parser";
import createError from "../../common/parser-create-error.js";
import { tryCombinationsSync } from "../../utilities/try-combinations.js";
import postprocess from "./postprocess/index.js";
import createParser from "./utilities/create-parser.js";
import jsxRegexp from "./utilities/jsx-regexp.evaluate.js";
import {
  getSourceType,
  SOURCE_TYPE_COMBINATIONS,
} from "./utilities/source-types.js";

/** @import {ParserOptions} from "yuku-parser" */

function createParseError(error, { text }) {
  /* c8 ignore next 3 */
  if (!error?.labels?.[0]) {
    return error;
  }

  const {
    message,
    labels: [{ start: startIndex, end: endIndex }],
  } = error;

  const [start, end] = [startIndex, endIndex].map((index) =>
    indexToPosition(text, index, { oneBased: true }),
  );

  return createError(message, {
    loc: {
      start,
      end,
    },
    cause: error,
  });
}

/**
@param {string} filepath
@param {string} text
@param {ParserOptions} options
*/
function parseWithOptions(filepath, text, options) {
  const result = yukuParse(text, {
    preserveParens: true,
    allowReturnOutsideFunction: true,
    semanticErrors: false,
    attachComments: false,
    ...options,
  });

  const { diagnostics: errors } = result;
  for (const error of errors) {
    throw createParseError(error, { text });
  }

  return result;
}

function parseJs(text, options) {
  let filepath = options?.filepath;
  const sourceType = getSourceType(filepath);

  if (typeof filepath !== "string") {
    filepath = "prettier.jsx";
  }

  const combinations = (
    sourceType ? [sourceType] : SOURCE_TYPE_COMBINATIONS
  ).map(
    (sourceType) => () =>
      parseWithOptions(filepath, text, { sourceType, lang: "jsx" }),
  );

  let result;
  try {
    result = tryCombinationsSync(combinations);
  } catch ({
    // @ts-expect-error -- expected
    errors: [error],
  }) {
    throw error;
  }

  const { program: ast, comments } = result;

  // @ts-expect-error -- expected
  ast.comments = comments;

  return postprocess(ast, { text });
}

const yuku = /* @__PURE__ */ createParser(parseJs);

export { yuku };
