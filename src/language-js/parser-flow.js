"use strict";

const createError = require("../common/parser-create-error");
const postprocess = require("./parse-postprocess");
const createParser = require("./parser/create-parser");
const replaceHashbang = require("./parser/replace-hashbang");

// https://github.com/facebook/flow/tree/master/packages/flow-parser#options
const parseOptions = {
  // `all_comments` (boolean, default `true`) - include a list of all comments from the whole program
  // all_comments: true,
  // `comments` (boolean, default `true`) - attach comments to AST nodes (`leadingComments` and `trailingComments`)
  comments: false,
  // `enums` (boolean, default `false`) - enable parsing of Flow enums
  enums: true,
  // `esproposal_class_instance_fields` (boolean, default `false`) - enable parsing of class instance fields
  esproposal_class_instance_fields: true,
  // `esproposal_class_static_fields` (boolean, default `false`) - enable parsing of class static fields
  esproposal_class_static_fields: true,
  // `esproposal_decorators` (boolean, default `false`) - enable parsing of decorators
  esproposal_decorators: true,
  // `esproposal_export_star_as` (boolean, default `false`) - enable parsing of `export * as` syntax
  esproposal_export_star_as: true,
  // `esproposal_nullish_coalescing` (boolean, default `false`) - enable parsing of nullish coalescing (`??`)
  esproposal_nullish_coalescing: true,
  // `esproposal_optional_chaining` (boolean, default `false`) - enable parsing of optional chaining (`?.`)
  esproposal_optional_chaining: true,
  // `types` (boolean, default `true`) - enable parsing of Flow types
  // types: true,
  // `use_strict` (boolean, default `false`) - treat the file as strict, without needing a "use strict" directive
  // use_strict: false,
  // Not documented
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

function parse(text, parsers, opts) {
  // Inline the require to avoid loading all the JS if we don't use it
  const { parse } = require("flow-parser");
  const ast = parse(replaceHashbang(text), parseOptions);
  const [error] = ast.errors;
  if (error) {
    throw createParseError(error);
  }

  return postprocess(ast, { ...opts, originalText: text });
}

// Export as a plugin so we can reuse the same bundle for UMD loading
module.exports = {
  parsers: {
    flow: createParser(parse),
  },
};
