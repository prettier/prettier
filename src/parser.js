"use strict";

function createError(message, line, column) {
  // Construct an error similar to the ones thrown by Babylon.
  const error = new SyntaxError(message + " (" + line + ":" + column + ")");
  error.loc = { line, column };
  return error;
}

function parse(text, opts) {
  let parseFunction;

  if (opts.parser === "flow") {
    parseFunction = parseWithFlow;
  } else if (opts.parser === "typescript") {
    parseFunction = parseWithTypeScript;
  } else {
    parseFunction = parseWithBabylon;
  }

  try {
    return parseFunction(text);
  } catch (error) {
    const loc = error.loc;

    if (loc) {
      error.codeFrame = codeFrame(text, loc.line, loc.column + 1, {
        highlightCode: true
      });
      error.message += "\n" + error.codeFrame;
    }

    throw error;
  }
}

function parseWithFlow(text) {
  // Inline the require to avoid loading all the JS if we don't use it
  const flowParser = require("flow-parser");

  const ast = flowParser.parse(text, {
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
  const jsx = isProbablyJsx(text);
  try {
    try {
      // Try passing with our best guess first.
      return tryParseTypeScript(text, jsx);
    } catch (e) {
      // But if we get it wrong, try the opposite.
      return tryParseTypeScript(text, !jsx);
    }
  } catch(e) {
    throw createError(
      e.message,
      e.lineNumber,
      e.column
    );
  }
}

function tryParseTypeScript(text, jsx) {
  // While we are working on typescript, we are putting it in devDependencies
  // so it shouldn't be picked up by static analysis
  const r = require;
  const parser = r("typescript-eslint-parser");
  return parser.parse(text, {
    loc: true,
    range: true,
    tokens: true,
    attachComment: true,
    ecmaFeatures: { jsx }
  });
}

/**
 * Use a naive regular expression until we address
 * https://github.com/prettier/prettier/issues/1538
 */
function isProbablyJsx(text) {
  return new RegExp([
    "(^[^\"'`]*</)", // Contains "</" when probably not in a string
    "|",
    "(^[^/]{2}.*\/>)" // Contains "/>" on line not starting with "//"
  ].join(""), "m").test(text);
}

function cleanAST(ast) {
  return JSON.stringify(massageAST(ast), null, 2);
}

function massageAST(ast) {
  if (Array.isArray(ast)) {
    return ast.map(e => massageAST(e)).filter(e => e);
  }
  if (ast && typeof ast === "object") {
    // We remove extra `;` and add them when needed
    if (ast.type === "EmptyStatement") {
      return undefined;
    }

    // We move text around, including whitespaces and add {" "}
    if (ast.type === "JSXText") {
      return undefined;
    }
    if (
      ast.type === "JSXExpressionContainer" &&
      ast.expression.type === "Literal" &&
      ast.expression.value === " "
    ) {
      return undefined;
    }

    const newObj = {};
    for (var key in ast) {
      newObj[key] = massageAST(ast[key]);
    }

    [
      "loc",
      "range",
      "raw",
      "comments",
      "leadingComments",
      "trailingComments",
      "extra",
      "start",
      "end",
      "tokens",
      "flags"
    ].forEach(name => {
      delete newObj[name];
    });

    // We convert <div></div> to <div />
    if (ast.type === "JSXOpeningElement") {
      delete newObj.selfClosing;
    }
    if (ast.type === "JSXElement") {
      delete newObj.closingElement;
    }

    // We change {'key': value} into {key: value}
    if (
      (ast.type === "Property" ||
        ast.type === "MethodDefinition" ||
          ast.type === "ClassProperty") &&
      typeof ast.key === "object" &&
      ast.key &&
      (ast.key.type === "Literal" || ast.key.type === "Identifier")
    ) {
      delete newObj.key;
    }

    return newObj;
  }
  return ast;
}

module.exports = { parse, parseWithFlow, parseWithBabylon, parseWithTypeScript, cleanAST };
