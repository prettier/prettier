"use strict";

const createError = require("../common/parser-create-error");
const hasPragma = require("./pragma").hasPragma;
const locFns = require("./loc");

function parse(text, parsers, opts) {
  // Inline the require to avoid loading all the JS if we don't use it
  const babylon = require("@babel/parser");

  const babylonOptions = {
    sourceType: "module",
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    plugins: [
      "jsx",
      "flow",
      "doExpressions",
      "objectRestSpread",
      "decorators-legacy",
      "classProperties",
      "exportDefaultFrom",
      "exportNamespaceFrom",
      "asyncGenerators",
      "functionBind",
      "functionSent",
      "dynamicImport",
      "numericSeparator",
      "importMeta",
      "optionalCatchBinding",
      "optionalChaining",
      "classPrivateProperties",
      "pipelineOperator",
      "nullishCoalescingOperator"
    ]
  };

  const parseMethod =
    opts && (opts.parser === "json" || opts.parser === "json5")
      ? "parseExpression"
      : "parse";

  let ast;
  try {
    ast = babylon[parseMethod](text, babylonOptions);
  } catch (originalError) {
    try {
      ast = babylon[parseMethod](
        text,
        Object.assign({}, babylonOptions, { strictMode: false })
      );
    } catch (nonStrictError) {
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
  }
  delete ast.tokens;
  return ast;
}

function parseJson(text, parsers, opts) {
  const ast = parse(text, parsers, Object.assign({}, opts, { parser: "json" }));

  ast.comments.forEach(assertJsonNode);
  assertJsonNode(ast);

  return ast;
}

function assertJsonNode(node, parent) {
  switch (node.type) {
    case "ArrayExpression":
      return node.elements.forEach(assertJsonChildNode);
    case "ObjectExpression":
      return node.properties.forEach(assertJsonChildNode);
    case "ObjectProperty":
      // istanbul ignore if
      if (node.computed) {
        throw createJsonError("computed");
      }
      // istanbul ignore if
      if (node.shorthand) {
        throw createJsonError("shorthand");
      }
      return [node.key, node.value].forEach(assertJsonChildNode);
    case "UnaryExpression":
      switch (node.operator) {
        case "+":
        case "-":
          return assertJsonChildNode(node.argument);
        // istanbul ignore next
        default:
          throw createJsonError("operator");
      }
    case "Identifier":
      if (parent && parent.type === "ObjectProperty" && parent.key === node) {
        return;
      }
      throw createJsonError();
    case "NullLiteral":
    case "BooleanLiteral":
    case "NumericLiteral":
    case "StringLiteral":
      return;
    // istanbul ignore next
    default:
      throw createJsonError();
  }

  function assertJsonChildNode(child) {
    return assertJsonNode(child, node);
  }

  // istanbul ignore next
  function createJsonError(attribute) {
    const name = !attribute
      ? node.type
      : `${node.type} with ${attribute}=${JSON.stringify(node[attribute])}`;
    return createError(`${name} is not allowed in JSON.`, {
      start: {
        line: node.loc.start.line,
        column: node.loc.start.column + 1
      }
    });
  }
}

const babylon = Object.assign(
  { parse, astFormat: "estree", hasPragma },
  locFns
);

// Export as a plugin so we can reuse the same bundle for UMD loading
module.exports = {
  parsers: {
    babylon,
    json: Object.assign({}, babylon, {
      hasPragma() {
        return true;
      }
    }),
    json5: babylon,
    "json-stringify": Object.assign(
      {
        parse: parseJson,
        astFormat: "estree-json"
      },
      locFns
    )
  }
};
