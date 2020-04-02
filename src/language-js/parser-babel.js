"use strict";

const createError = require("../common/parser-create-error");
const { hasPragma } = require("./pragma");
const locFns = require("./loc");
const postprocess = require("./postprocess");

function babelOptions(extraPlugins = []) {
  return {
    sourceType: "module",
    allowAwaitOutsideFunction: true,
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    allowSuperOutsideMethod: true,
    allowUndeclaredExports: true,
    errorRecovery: true,
    createParenthesizedExpressions: true,
    plugins: [
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
      "throwExpressions",
      "logicalAssignment",
      "classPrivateMethods",
      "v8intrinsic",
      "partialApplication",
      ["decorators", { decoratorsBeforeExport: false }],
      ...extraPlugins,
    ],
  };
}

function createParse(parseMethod, ...pluginCombinations) {
  return (text, parsers, opts) => {
    // Inline the require to avoid loading all the JS if we don't use it
    const babel = require("@babel/parser");

    let ast;
    try {
      ast = tryCombinations(
        (options) => babel[parseMethod](text, options),
        pluginCombinations.map(babelOptions)
      );
    } catch (error) {
      throw createError(
        // babel error prints (l:c) with cols that are zero indexed
        // so we need our custom error
        error.message.replace(/ \(.*\)/, ""),
        {
          start: {
            line: error.loc.line,
            column: error.loc.column + 1,
          },
        }
      );
    }
    delete ast.tokens;
    return postprocess(ast, { ...opts, originalText: text });
  };
}

const parse = createParse("parse", ["jsx", "flow"]);
const parseFlow = createParse("parse", [
  "jsx",
  ["flow", { all: true, enums: true }],
]);
const parseTypeScript = createParse(
  "parse",
  ["jsx", "typescript"],
  ["typescript"]
);
const parseExpression = createParse("parseExpression", ["jsx"]);

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
  const ast = parseExpression(text, parsers, opts);

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
        column: node.loc.start.column + 1,
      },
    });
  }
}

const babel = { parse, astFormat: "estree", hasPragma, ...locFns };
const babelFlow = { ...babel, parse: parseFlow };
const babelTypeScript = { ...babel, parse: parseTypeScript };
const babelExpression = { ...babel, parse: parseExpression };

// Export as a plugin so we can reuse the same bundle for UMD loading
module.exports = {
  parsers: {
    babel,
    "babel-flow": babelFlow,
    "babel-ts": babelTypeScript,
    json: {
      ...babelExpression,
      hasPragma() {
        return true;
      },
    },
    json5: babelExpression,
    "json-stringify": {
      parse: parseJson,
      astFormat: "estree-json",
      ...locFns,
    },
    /** @internal */
    __js_expression: babelExpression,
    /** for vue filter */
    __vue_expression: babelExpression,
    /** for vue event binding to handle semicolon */
    __vue_event_binding: babel,
  },
};
