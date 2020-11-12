"use strict";

const createError = require("../common/parser-create-error");
const { hasPragma } = require("./pragma");
const { locStart, locEnd } = require("./loc");
const postprocess = require("./postprocess");

function parse(text, parsers, opts) {
  const jsx = isProbablyJsx(text);
  let result;
  try {
    // Try passing with our best guess first.
    result = tryParseTypeScript(text, jsx);
  } catch (firstError) {
    try {
      // But if we get it wrong, try the opposite.
      result = tryParseTypeScript(text, !jsx);
    } catch (secondError) {
      // Suppose our guess is correct, throw the first error
      const { message, lineNumber, column } = firstError;

      /* istanbul ignore next */
      if (typeof lineNumber !== "number") {
        throw firstError;
      }

      throw createError(message, {
        start: { line: lineNumber, column: column + 1 },
      });
    }
  }

  if (text.includes("@")) {
    checkMissingDecorators(result);
  }

  return postprocess(result.ast, { ...opts, originalText: text });
}

function checkMissingDecorators(result) {
  const { program, tsNodeToESTreeNodeMap } = result.services;
  const sourceFile = program.getSourceFile();
  const allTsDecorators = getTsDecorators(sourceFile, {
    decorators: new Map(),
    visited: new Set(),
  });

  for (const [tsNode, tsDecorators] of allTsDecorators) {
    const esNode = tsNodeToESTreeNodeMap.get(tsNode);
    const esDecorators = esNode.decorators;
    if (
      !Array.isArray(esDecorators) ||
      esDecorators.length !== tsDecorators.length ||
      tsDecorators.some((tsDecorator) => {
        const esDecorator = tsNodeToESTreeNodeMap.get(tsDecorator);
        return !esDecorator || !esDecorators.includes(esDecorator);
      })
    ) {
      const { start, end } = esNode.loc;

      throw createError(
        "Leading decorators must be attached to a class declaration",
        {
          start: { line: start.line, column: start.column + 1 },
          end: { line: end.line, column: end.column + 1 },
        }
      );
    }
  }
}

function getTsDecorators(object, options) {
  const { visited, decorators } = options;

  if (typeof object !== "object" || !object || visited.has(object)) {
    return decorators;
  }
  visited.add(object);

  let children;
  if (Array.isArray(object)) {
    children = object;
  } else {
    children = Object.values(object);

    if (Array.isArray(object.decorators) && object.decorators.length > 0) {
      decorators.set(object, object.decorators);
    }
  }

  for (const child of children) {
    getTsDecorators(child, options);
  }

  return decorators;
}

function tryParseTypeScript(text, jsx) {
  const parser = require("@typescript-eslint/typescript-estree");
  return parser.parseAndGenerateServices(text, {
    // `jest@<=26.4.2` rely on `loc`
    // https://github.com/facebook/jest/issues/10444
    loc: true,
    range: true,
    comment: true,
    useJSXTextNode: true,
    jsx,
    tokens: true,
    loggerFn: false,
    project: [],
  });
}

/**
 * Use a naive regular expression to detect JSX
 */
function isProbablyJsx(text) {
  return new RegExp(
    [
      "(^[^\"'`]*</)", // Contains "</" when probably not in a string
      "|",
      "(^[^/]{2}.*/>)", // Contains "/>" on line not starting with "//"
    ].join(""),
    "m"
  ).test(text);
}

const parser = { parse, astFormat: "estree", hasPragma, locStart, locEnd };

// Export as a plugin so we can reuse the same bundle for UMD loading
module.exports = {
  parsers: {
    typescript: parser,
  },
};
