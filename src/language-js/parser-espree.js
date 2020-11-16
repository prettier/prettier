"use strict";
const { parseHashbang } = require("../common/util");
const createError = require("../common/parser-create-error");
const { hasPragma } = require("./pragma");
const { locStart, locEnd } = require("./loc");
const postprocess = require("./parse-postprocess");

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
  let text = originalText;

  // Replace hashbang with space
  const hashbang = parseHashbang(originalText);
  if (hashbang) {
    const hashBangLength = locEnd(hashbang);
    text = " ".repeat(hashBangLength) + originalText.slice(hashBangLength);
  }

  let ast;

  try {
    ast = parse(text, espreeOptions);
  } catch (moduleError) {
    try {
      ast = parse(text, { ...espreeOptions, sourceType: "script" });
    } catch (_) {
      // throw the error for `module` parsing
      const { message, lineNumber, column } = moduleError;

      /* istanbul ignore next */
      if (typeof lineNumber !== "number") {
        throw moduleError;
      }

      throw createError(message, { start: { line: lineNumber, column } });
    }
  }

  ast.comments.unshift(hashbang);

  return postprocess(ast, { ...options, originalText });
}

module.exports = {
  parsers: {
    espree: { parse, astFormat: "estree", hasPragma, locStart, locEnd },
  },
};
