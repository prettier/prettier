import { parse as espreeParse } from "espree";
import createError from "../../common/parser-create-error.js";
import tryCombinations from "../../utils/try-combinations.js";
import postprocess from "./postprocess/index.js";
import createParser from "./utils/create-parser.js";
import {
  getSourceType,
  SOURCE_TYPE_COMBINATIONS,
} from "./utils/source-types.js";

/** @import {Options} from "espree" */

/** @type {Options} */
const parseOptions = {
  ecmaVersion: "latest",
  range: true,
  loc: false,
  comment: true,
  tokens: false,
  ecmaFeatures: {
    jsx: true,
    globalReturn: true,
    impliedStrict: false,
  },
};

function createParseError(error) {
  const { message, lineNumber, column } = error;

  /* c8 ignore next 3 */
  if (typeof lineNumber !== "number") {
    return error;
  }

  return createError(message, {
    loc: { start: { line: lineNumber, column } },
    cause: error,
  });
}

function parse(text, options) {
  const sourceType = getSourceType(options?.filepath);
  const combinations = (
    sourceType ? [sourceType] : SOURCE_TYPE_COMBINATIONS
  ).map(
    (sourceType) => () => espreeParse(text, { ...parseOptions, sourceType }),
  );

  let ast;
  try {
    ast = tryCombinations(combinations);
  } catch (/** @type {any} */ { errors: [error] }) {
    throw createParseError(error);
  }

  return postprocess(ast, { parser: "espree", text });
}

export const espree = createParser(parse);
