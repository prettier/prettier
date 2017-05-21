const parser = require("flow-parser");
const createError = require("./create-error");

function parseWithFlow(text) {
  const ast = parser.parse(text, {
    esproposal_class_instance_fields: true,
    esproposal_class_static_fields: true,
    esproposal_export_star_as: true
  });

  if (ast.errors.length > 0) {
    throw createError(
      ast.errors[0].message,
      ast.errors[0].loc.start.line,
      ast.errors[0].loc.start.column
    );
  }

  return ast;
}

module.exports = parseWithFlow;
