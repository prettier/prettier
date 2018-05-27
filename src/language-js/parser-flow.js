"use strict";

const createError = require("../common/parser-create-error");
const includeShebang = require("../common/parser-include-shebang");
const { hasPragma } = require("./pragma");
const locFns = require("./loc");

function parse(text /*, parsers, opts*/) {
  // Fixes Node 4 issue (#1986)
  "use strict"; // eslint-disable-line
  // Inline the require to avoid loading all the JS if we don't use it
  const flowParser = require("flow-parser");

  const ast = flowParser.parse(text, {
    esproposal_class_instance_fields: true,
    esproposal_class_static_fields: true,
    esproposal_export_star_as: true,
    esproposal_optional_chaining: true,
    esproposal_nullish_coalescing: true
  });

  if (ast.errors.length > 0) {
    const [{ loc, message }] = ast.errors;
    throw createError(message, {
      start: { line: loc.start.line, column: loc.start.column + 1 },
      end: { line: loc.end.line, column: loc.end.column + 1 }
    });
  }

  includeShebang(text, ast);
  return ast;
}

// Export as a plugin so we can reuse the same bundle for UMD loading
module.exports = {
  parsers: {
    flow: Object.assign({ parse, astFormat: "estree", hasPragma }, locFns)
  }
};
