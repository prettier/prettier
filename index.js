"use strict";
const babylon = require("babylon");
const printAstToDoc = require("./src/printer").printAstToDoc;
const flowParser = require("flow-parser");
const comments = require("./src/comments");
const version = require("./package.json").version;
const pp = require("./src/pp");
const normalizeOptions = require("./src/options").normalize;

var babylonOptions = {
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
};

function format(text, opts) {
  let ast;

  opts = normalizeOptions(opts);

  if (opts.useFlowParser) {
    ast = flowParser.parse(text, {
      esproposal_class_instance_fields: true,
      esproposal_class_static_fields: true,
      esproposal_export_star_as: true
    });
    if (ast.errors.length > 0) {
      let msg = ast.errors[0].message +
        " on line " +
        ast.errors[0].loc.start.line;
      if (opts.filename) {
        msg += " in file " + opts.filename;
      }
      throw new Error(msg);
    }
  } else {
    ast = babylon.parse(text, babylonOptions);
  }

  // Interleave comment nodes
  if (ast.comments) {
    comments.attach(ast.comments, ast, text);
    ast.comments = [];
  }
  ast.tokens = [];
  opts.originalText = text;

  const doc = printAstToDoc(ast, opts)
  return pp.print(opts.printWidth, doc);
}

function formatWithShebang(text, opts) {
  if (!text.startsWith("#!")) {
    return format(text, opts);
  }

  const index = text.indexOf("\n");
  const shebang = text.slice(0, index + 1);
  const programText = text.slice(index + 1);
  const nextChar = text.charAt(index + 1);
  const addNewline = nextChar == "\n" || nextChar == "\r";

  return shebang + (addNewline ? "\n" : "") + format(programText, opts);
}

module.exports = {
  format: function(text, opts) {
    return formatWithShebang(text, opts);
  },
  version: version
};
