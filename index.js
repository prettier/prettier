"use strict";
const babylon = require("babylon");
const Printer = require("./src/printer").Printer;
const flowParser = require("flow-parser");
const comments = require("./src/comments");
const version = require("./package.json").version;

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

function getPrinter(text, opts) {
  opts = opts || {};
  opts.originalText = text;
  return new Printer(opts);
}

function getAst(text, opts) {
  opts = opts || {};
  let ast;

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
  return ast;
}

function getDocs(text, opts) {
  return getPrinter(text, opts).getDocs(getAst(text, opts));
}

function format(text, opts) {
  return getPrinter(text, opts).print(getAst(text, opts));
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
  getDocs: getDocs,
  version: version
};
