import { createRequire } from "node:module";
import createError from "../../common/parser-create-error.js";
import tryCombinations from "../../utils/try-combinations.js";
import createParser from "./utils/create-parser.js";
import postprocess from "./postprocess/index.js";

const require = createRequire(import.meta.url);

/** @type {import("espree").Options} */
const parseOptions = {
  ecmaVersion: "latest",
  range: true,
  loc: true,
  comment: true,
  tokens: true,
  sourceType: "module",
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

function parse(text, options = {}) {
  const { parse: espreeParse } = require("espree");

  const { result: ast, error: moduleParseError } = tryCombinations(
    () => espreeParse(text, { ...parseOptions, sourceType: "module" }),
    () => espreeParse(text, { ...parseOptions, sourceType: "script" })
  );

  if (!ast) {
    // throw the error for `module` parsing
    throw createParseError(moduleParseError);
  }

  options.originalText = text;
  return postprocess(ast, options);
}

export default createParser(parse);
