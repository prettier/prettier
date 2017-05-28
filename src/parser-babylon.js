"use strict";

function parse(text) {
  // Inline the require to avoid loading all the JS if we don't use it
  const babylon = require("babylon");

  const babylonOptions = {
    sourceType: "module",
    allowImportExportEverywhere: false,
    allowReturnOutsideFunction: true,
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

  let ast;
  try {
    ast = babylon.parse(text, babylonOptions);
  } catch (originalError) {
    try {
      return babylon.parse(
        text,
        Object.assign({}, babylonOptions, { strictMode: false })
      );
    } catch (nonStrictError) {
      throw originalError;
    }
  }
  delete ast.tokens;
  return ast;
}

module.exports = parse;
