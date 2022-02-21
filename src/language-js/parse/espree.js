// TODO[@fisker]: try inline import this module
import { parse as espreeParse } from "espree";

import createError from "../../common/parser-create-error.js";
import tryCombinations from "../../utils/try-combinations.js";
import createParser from "./utils/create-parser.js";
import replaceHashbang from "./utils/replace-hashbang.js";
import postprocess from "./postprocess/index.js";

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

  /* istanbul ignore next */
  if (typeof lineNumber !== "number") {
    return error;
  }

  return createError(message, { start: { line: lineNumber, column } });
}

function parse(originalText, parsers, options = {}) {
  const textToParse = replaceHashbang(originalText);
  const { result: ast, error: moduleParseError } = tryCombinations(
    () => espreeParse(textToParse, { ...parseOptions, sourceType: "module" }),
    () => espreeParse(textToParse, { ...parseOptions, sourceType: "script" })
  );

  if (!ast) {
    // throw the error for `module` parsing
    throw createParseError(moduleParseError);
  }

  options.originalText = originalText;
  return postprocess(ast, options);
}

export default createParser(parse);
