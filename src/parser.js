"use strict";

function parseWithFlow(text) {
  // Inline the require to avoid loading all the JS if we don't use it
  const flowParser = require("flow-parser");

  const ast = flowParser.parse(text, {
    esproposal_class_instance_fields: true,
    esproposal_class_static_fields: true,
    esproposal_export_star_as: true
  });

  if (ast.errors.length > 0) {
    // Construct an error similar to the ones thrown by Babylon.
    const loc = {
      line: ast.errors[0].loc.start.line,
      column: ast.errors[0].loc.start.column
    };
    const msg =
      ast.errors[0].message + " (" + loc.line + ":" + loc.column + ")";
    const error = new SyntaxError(msg);
    error.loc = loc;
    throw error;
  }

  return ast;
}

function parseWithBabylon(text) {
  // Inline the require to avoid loading all the JS if we don't use it
  const babylon = require("babylon");

  return babylon.parse(text, {
    sourceType: "module",
    allowImportExportEverywhere: false,
    allowReturnOutsideFunction: false,
    plugins: [
      "jsx",
      "flow",
      "doExpressions",
      "objectRestSpread",
      "decorators",
      "classProperties",
      "exportExtensions",
      "asyncGenerators",
      "functionBind",
      "functionSent",
      "dynamicImport"
    ]
  });
}

function parseWithTypeScript(text) {
  // While we are working on typescript, we are putting it in devDependencies
  // so it shouldn't be picked up by static analysis
  const r = require;
  const parser = r("typescript-eslint-parser");
  return parser.parse(text, {
    loc: true,
    range: true,
    tokens: true,
    attachComment: true,
    ecmaFeatures: {
      jsx: true
    }
  });
}

module.exports = { parseWithFlow, parseWithBabylon, parseWithTypeScript };
