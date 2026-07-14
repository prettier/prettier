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

/** @import {ParseOptions} from "yuku-parser" */

function createParseError(error, { text }) {
  if (typeof error?.start !== "number" || typeof error?.end !== "number") {
    return error;
  }

  const { message, start: startIndex, end: endIndex } = error;

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
@param {string} text
@param {ParseOptions} options
*/
function parseWithOptions(text, options) {
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
  const filepath = options?.filepath;
  const sourceType = getSourceType(filepath);

  const combinations = (
    sourceType ? [sourceType] : SOURCE_TYPE_COMBINATIONS
  ).map(
    (sourceType) => () =>
      parseWithOptions(text, {
        sourceType: sourceType === "commonjs" ? "script" : sourceType,
        lang: "jsx",
      }),
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

  return postprocess(ast, { text, astType: "yuku-js" });
}

const yuku = /* @__PURE__ */ createParser(parseJs);

export { yuku };
