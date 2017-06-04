"use strict";

const createError = require("../common/parser-create-error");
const includeShebang = require("../common/parser-include-shebang");

function parse(text /*, parsers, opts*/) {
  const jsx = isProbablyJsx(text);
  let ast;
  try {
    try {
      // Try passing with our best guess first.
      ast = tryParseTypeScript(text, jsx);
    } catch (e) {
      // But if we get it wrong, try the opposite.
      /* istanbul ignore next */
      ast = tryParseTypeScript(text, !jsx);
    }
  } catch (e) /* istanbul ignore next */ {
    if (typeof e.lineNumber === "undefined") {
      throw e;
    }

    throw createError(e.message, {
      start: { line: e.lineNumber, column: e.column + 1 }
    });
  }

  delete ast.tokens;
  includeShebang(text, ast);
  return ast;
}

function tryParseTypeScript(text, jsx) {
  const parser = require("typescript-eslint-parser");
  return parser.parse(text, {
    loc: true,
    range: true,
    tokens: true,
    comment: true,
    useJSXTextNode: true,
    ecmaFeatures: { jsx },
    // Override logger function with noop,
    // to avoid unsupported version errors being logged
    loggerFn: () => {}
  });
}

/**
 * Use a naive regular expression to detect JSX
 */
function isProbablyJsx(text) {
  return new RegExp(
    [
      "(^[^\"'`]*</)", // Contains "</" when probably not in a string
      "|",
      "(^[^/]{2}.*/>)" // Contains "/>" on line not starting with "//"
    ].join(""),
    "m"
  ).test(text);
}

module.exports = parse;
