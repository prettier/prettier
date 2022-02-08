"use strict";

const createError = require("../../common/parser-create-error.js");
const createParser = require("./utils/create-parser.js");
const replaceHashbang = require("./utils/replace-hashbang.js");
const postprocess = require("./postprocess/index.js");

// https://github.com/facebook/flow/tree/main/packages/flow-parser#options
// Keep this sync with `/scripts/sync-flow-test.js`
const parseOptions = {
  // `all_comments` (boolean, default `true`) - include a list of all comments from the whole program
  // all_comments: true,
  // `comments` (boolean, default `true`) - attach comments to AST nodes (`leadingComments` and `trailingComments`)
  comments: false,
  // `enums` (boolean, default `false`) - enable parsing of Flow enums
  enums: true,
  // `esproposal_decorators` (boolean, default `false`) - enable parsing of decorators
  esproposal_decorators: true,
  // `esproposal_export_star_as` (boolean, default `false`) - enable parsing of `export * as` syntax
  esproposal_export_star_as: true,
  // `types` (boolean, default `true`) - enable parsing of Flow types
  // types: true,
  // `use_strict` (boolean, default `false`) - treat the file as strict, without needing a "use strict" directive
  // use_strict: false,
  // `tokens` (boolean, default `false`) - include a list of all parsed tokens in a top-level `tokens` property
  tokens: true,
};

function createParseError(error) {
  const {
    message,
    loc: { start, end },
  } = error;

  return createError(message, {
    start: { line: start.line, column: start.column + 1 },
    end: { line: end.line, column: end.column + 1 },
  });
}

function parse(text, parsers, options = {}) {
  // Inline the require to avoid loading all the JS if we don't use it
  const { parse } = require("flow-parser");
  const ast = parse(replaceHashbang(text), parseOptions);
  const [error] = ast.errors;
  if (error) {
    throw createParseError(error);
  }

  options.originalText = text;
  return postprocess(ast, options);
}

// Export as a plugin so we can reuse the same bundle for UMD loading
module.exports = {
  parsers: {
    flow: createParser(parse),
  },
};
