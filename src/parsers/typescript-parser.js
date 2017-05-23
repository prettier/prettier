const parser = require("typescript-eslint-parser");
const createError = require("./create-error");

function parseWithTypeScript(text) {
  const jsx = isProbablyJsx(text);
  try {
    try {
      // Try passing with our best guess first.
      return tryParseTypeScript(text, jsx);
    } catch (e) {
      // But if we get it wrong, try the opposite.
      return tryParseTypeScript(text, !jsx);
    }
  } catch (e) {
    throw createError(e.message, e.lineNumber, e.column);
  }
}

function tryParseTypeScript(text, jsx) {
  // While we are working on typescript, we are putting it in devDependencies
  // so it shouldn't be picked up by static analysis
  return parser.parse(text, {
    loc: true,
    range: true,
    tokens: true,
    comment: true,
    useJSXTextNode: true,
    ecmaFeatures: { jsx }
  });
}

/**
 * Use a naive regular expression until we address
 * https://github.com/prettier/prettier/issues/1538
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

module.exports = parseWithTypeScript;
