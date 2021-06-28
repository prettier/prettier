"use strict";
const createError = require("../common/parser-create-error");
const tryCombinations = require("../utils/try-combinations");
const postprocess = require("./parse-postprocess");
const createParser = require("./parser/create-parser");
const replaceHashbang = require("./parser/replace-hashbang");

const parseOptions = {
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

function parse(originalText, parsers, options) {
  const { parse, latestEcmaVersion } = require("espree");
  parseOptions.ecmaVersion = latestEcmaVersion;

  const textToParse = replaceHashbang(originalText);
  const { result: ast, error: moduleParseError } = tryCombinations(
    () => parse(textToParse, { ...parseOptions, sourceType: "module" }),
    () => parse(textToParse, { ...parseOptions, sourceType: "script" })
  );

  if (!ast) {
    // throw the error for `module` parsing
    throw createParseError(moduleParseError);
  }

  return postprocess(ast, { ...options, originalText });
}

module.exports = {
  parsers: {
    espree: createParser(parse),
  },
};
