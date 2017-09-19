"use strict";

const createError = require("./parser-create-error");

const basePlugins = [
  "jsx",
  "flow",
  "doExpressions",
  "objectRestSpread",
  "classProperties",
  "exportExtensions",
  "asyncGenerators",
  "functionBind",
  "functionSent",
  "dynamicImport",
  "numericSeparator",
  "importMeta",
  "optionalCatchBinding",
  "optionalChaining"
];

function babylonOptions(extraOptions, extraPlugins) {
  return Object.assign(
    {
      sourceType: "module",
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      plugins: basePlugins.concat(extraPlugins)
    },
    extraOptions
  );
}

function parse(text, parsers, opts) {
  // Inline the require to avoid loading all the JS if we don't use it
  const babylon = require("babylon");

  const combinations = [
    babylonOptions({ strictMode: true }, ["decorators2"]),
    babylonOptions({ strictMode: false }, ["decorators2"]),
    babylonOptions({ strictMode: true }, ["decorators"]),
    babylonOptions({ strictMode: false }, ["decorators"])
  ];

  const parseMethod =
    opts && opts.parser === "json" ? "parseExpression" : "parse";

  const parseFunction = options => babylon[parseMethod](text, options);

  const result = tryCombinations(combinations, parseFunction);
  if (!result.success) {
    const originalError = result.errors[0];
    throw createError(
      // babel error prints (l:c) with cols that are zero indexed
      // so we need our custom error
      originalError.message.replace(/ \(.*\)/, ""),
      {
        start: {
          line: originalError.loc.line,
          column: originalError.loc.column + 1
        }
      }
    );
  }

  const ast = result.value;
  delete ast.tokens;
  return ast;
}

function tryCombinations(combinations, fn) {
  const errors = [];
  for (const combination of combinations) {
    try {
      return {
        success: true,
        value: fn(combination)
      };
    } catch (error) {
      errors.push(error);
    }
  }
  return { success: false, errors };
}

module.exports = parse;
