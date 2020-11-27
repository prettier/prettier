"use strict";
const { getShebang } = require("../common/util");
const createError = require("../common/parser-create-error");
const { hasPragma } = require("./pragma");
const { locStart, locEnd } = require("./loc");
const postprocess = require("./parse-postprocess");
const tryCombinations = require("./parser/try-combinations");

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
    throw error;
  }

  throw createError(message, { start: { line: lineNumber, column } });
}

function parse(originalText, parsers, options) {
  const { parse, latestEcmaVersion } = require("espree");
  parseOptions.ecmaVersion = latestEcmaVersion;

  // Replace shebang with space
  const shebang = getShebang(originalText);
  const text = shebang
    ? " ".repeat(shebang.length) + originalText.slice(shebang.length)
    : originalText;

  const [ast, moduleParseError] = tryCombinations(
    ["module", "script"],
    (sourceType) => parse(text, { ...parseOptions, sourceType })
  );

  if (!ast) {
    // throw the error for `module` parsing
    throw createParseError(moduleParseError);
  }

  return postprocess(ast, { ...options, originalText });
}

module.exports = {
  parsers: {
    espree: { parse, astFormat: "estree", hasPragma, locStart, locEnd },
  },
};
