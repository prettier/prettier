"use strict";
const { getShebang } = require("../common/util");
const createError = require("../common/parser-create-error");
const { hasPragma } = require("./pragma");
const { locStart, locEnd } = require("./loc");
const postprocess = require("./postprocess");

const espreeOptions = {
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

function parse(originalText, parsers, options) {
  const { parse, latestEcmaVersion } = require("espree");
  espreeOptions.ecmaVersion = latestEcmaVersion;

  // Replace shebang with space
  const shebang = getShebang(originalText);
  const text = shebang
    ? " ".repeat(shebang.length) + originalText.slice(shebang.length)
    : originalText;

  let ast;

  try {
    ast = parse(text, espreeOptions);
  } catch (error) {
    try {
      ast = parse(text, { ...espreeOptions, sourceType: "script" });
    } catch (_error) {
      // throw the error for `module` parsing
      if (typeof error.lineNumber === "undefined") {
        throw error;
      }

      throw createError(error.message, {
        start: { line: error.lineNumber, column: error.column },
      });
    }
  }

  return postprocess(ast, { ...options, originalText });
}

module.exports = {
  parsers: {
    espree: { parse, astFormat: "estree", hasPragma, locStart, locEnd },
  },
};
