"use strict";
const { getShebang } = require("../common/util");
const createError = require("../common/parser-create-error");
const tryCombinations = require("../utils/try-combinations");
const postprocess = require("./parse-postprocess");
const createParser = require("./parser/create-parser");

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

  // Replace shebang with space
  const shebang = getShebang(originalText);
  const text = shebang
    ? " ".repeat(shebang.length) + originalText.slice(shebang.length)
    : originalText;

  const { result: ast, error: moduleParseError } = tryCombinations(
    () => parse(text, { ...parseOptions, sourceType: "module" }),
    () => parse(text, { ...parseOptions, sourceType: "script" })
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
