"use strict";

const createError = require("../common/parser-create-error");
const hasPragma = require("./pragma").hasPragma;
const locFns = require("./loc");

function babylonOptions(extraOptions, extraPlugins) {
  return Object.assign(
    {
      sourceType: "module",
      allowAwaitOutsideFunction: true,
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
      plugins: [
        "jsx",
        "flow",
        "doExpressions",
        "objectRestSpread",
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
        ["pipelineOperator", { proposal: "minimal" }],
        "nullishCoalescingOperator",
        "bigInt",
        "throwExpressions"
      ].concat(extraPlugins)
    },
    extraOptions
  );
}

function parse(text, parsers, opts) {
  // Inline the require to avoid loading all the JS if we don't use it
  const babylon = require("@babel/parser");

  const combinations = [
    babylonOptions({ strictMode: true }, ["decorators-legacy"]),
    babylonOptions({ strictMode: false }, ["decorators-legacy"]),
    babylonOptions({ strictMode: true }, [
      ["decorators", { decoratorsBeforeExport: false }]
    ]),
    babylonOptions({ strictMode: false }, [
      ["decorators", { decoratorsBeforeExport: false }]
    ])
  ];

  const parseMethod =
    !opts || opts.parser === "babylon" ? "parse" : "parseExpression";

  let ast;
  try {
    ast = tryCombinations(babylon[parseMethod].bind(null, text), combinations);
  } catch (error) {
    throw createError(
      // babel error prints (l:c) with cols that are zero indexed
      // so we need our custom error
      error.message.replace(/ \(.*\)/, ""),
      {
        start: {
          line: error.loc.line,
          column: error.loc.column + 1
        }
      }
    );
  }
  delete ast.tokens;
  return ast;
}

function tryCombinations(fn, combinations) {
  let error;
  for (let i = 0; i < combinations.length; i++) {
    try {
      return fn(combinations[i]);
    } catch (_error) {
      if (!error) {
        error = _error;
      }
    }
  }
  throw error;
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
    ),
    /** @internal */
    __js_expression: babylon,
    /** for vue filter */
    __vue_expression: babylon
  }
};
