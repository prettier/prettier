"use strict";

const createError = require("./parser-create-error");

function parse(text) {
  // Inline the require to avoid loading all the JS if we don't use it
  const flowParser = require("flow-parser");

  const ast = flowParser.parse(text, {
    esproposal_class_instance_fields: true,
    esproposal_class_static_fields: true,
    esproposal_export_star_as: true
  });

  if (ast.errors.length > 0) {
    throw createError(
      ast.errors[0].message,
      ast.errors[0].loc.start.line,
      ast.errors[0].loc.start.column + 1
    );
  }

  if (!text.startsWith("#!")) {
    return ast;
  }

  const index = text.indexOf("\n");
  const shebang = text.slice(2, index);
  const comment = {
    type: "Line",
    loc: {
      source: null,
      start: {
        line: 1,
        column: 0
      },
      end: {
        line: 1,
        column: index
      }
    },
    range: [0, index],
    value: shebang
  };
  ast.comments = [comment].concat(ast.comments);

  return ast;
}
module.exports = parse;
