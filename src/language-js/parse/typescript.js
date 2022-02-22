"use strict";

const createError = require("../../common/parser-create-error.js");
const tryCombinations = require("../../utils/try-combinations.js");
const createParser = require("./utils/create-parser.js");
const replaceHashbang = require("./utils/replace-hashbang.js");
const postprocess = require("./postprocess/index.js");

/** @type {import("@typescript-eslint/typescript-estree").TSESTreeOptions} */
const parseOptions = {
  // `jest@<=26.4.2` rely on `loc`
  // https://github.com/facebook/jest/issues/10444
  loc: true,
  range: true,
  comment: true,
  jsx: true,
  tokens: true,
  loggerFn: false,
  project: [],
};

function createParseError(error) {
  const { message, lineNumber, column } = error;

  /* istanbul ignore next */
  if (typeof lineNumber !== "number") {
    return error;
  }

  return createError(message, {
    start: { line: lineNumber, column: column + 1 },
  });
}

function parse(text, parsers, options = {}) {
  const textToParse = replaceHashbang(text);
  const jsx = isProbablyJsx(text);

  const { parseWithNodeMaps } = require("@typescript-eslint/typescript-estree");
  const { result, error: firstError } = tryCombinations(
    // Try passing with our best guess first.
    () => parseWithNodeMaps(textToParse, { ...parseOptions, jsx }),
    // But if we get it wrong, try the opposite.
    () => parseWithNodeMaps(textToParse, { ...parseOptions, jsx: !jsx })
  );

  if (!result) {
    // Suppose our guess is correct, throw the first error
    throw createParseError(firstError);
  }

  options.originalText = text;
  options.tsParseResult = result;
  return postprocess(result.ast, options);
}

/**
 * Use a naive regular expression to detect JSX
 */
function isProbablyJsx(text) {
  return new RegExp(
    [
      "(?:^[^\"'`]*</)", // Contains "</" when probably not in a string
      "|",
      "(?:^[^/]{2}.*/>)", // Contains "/>" on line not starting with "//"
    ].join(""),
    "m"
  ).test(text);
}

// Export as a plugin so we can reuse the same bundle for UMD loading
module.exports = {
  parsers: {
    typescript: createParser(parse),
  },
};
