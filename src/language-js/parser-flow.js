"use strict";

const createError = require("../common/parser-create-error");
const postprocess = require("./parse-postprocess");
const createParser = require("./parser/create-parser");

const parseOptions = {
  enums: true,
  esproposal_decorators: true,
  esproposal_class_instance_fields: true,
  esproposal_class_static_fields: true,
  esproposal_export_star_as: true,
  esproposal_optional_chaining: true,
  esproposal_nullish_coalescing: true,
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
  const ast = parse(text, parseOptions);
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
