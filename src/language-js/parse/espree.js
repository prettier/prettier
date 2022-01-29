"use strict";

const createError = require("../../common/parser-create-error.js");
const tryCombinations = require("../../utils/try-combinations.js");
const createParser = require("./utils/create-parser.js");
const replaceHashbang = require("./utils/replace-hashbang.js");
const postprocess = require("./postprocess/index.js");

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
  const { parse } = require("espree");

  const textToParse = replaceHashbang(originalText);
  const { result: ast, error: moduleParseError } = tryCombinations(
    () => parse(textToParse, { ...parseOptions, sourceType: "module" }),
    () => parse(textToParse, { ...parseOptions, sourceType: "script" })
  );

  if (!ast) {
    // throw the error for `module` parsing
    throw createParseError(moduleParseError);
  }

  options.originalText = originalText;
  return postprocess(ast, options);
}

module.exports = createParser(parse);
