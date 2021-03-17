"use strict";

const assert = require("assert");
const AstPath = require("../common/ast-path");
const {
  builders: { hardline, addAlignmentToDoc },
  utils: { propagateBreaks },
} = require("../document");
const { printComments } = require("./comments");
const multiparser = require("./multiparser");

/**
 * Takes an abstract syntax tree (AST) and recursively converts it to a
 * document (series of printing primitives).
 *
 * This is done by descending down the AST recursively. The recursion
 * involves two functions that call each other:
 *
 * 1. printGenerically(), which is defined as an inner function here.
 *    It basically takes care of node caching.
 * 2. callPluginPrintFunction(), which checks for some options, and
 *    ultimately calls the print() function provided by the plugin.
 *
 * The plugin function will call printGenerically() again for child nodes
 * of the current node, which will do its housekeeping, then call the
 * plugin function again, and so on.
 *
 * All the while, these functions pass a "path" variable around, which
 * is a stack-like data structure (AstPath) that maintains the current
 * state of the recursion. It is called "path", because it represents
 * the path to the current node through the Abstract Syntax Tree.
 */
function printAstToDoc(ast, options, alignmentSize = 0) {
  const { printer } = options;

  if (printer.preprocess) {
    ast = printer.preprocess(ast, options);
  }

  const cache = new Map();
  const path = new AstPath(ast);

  let doc = (function printGenerically(nameOrNames, args) {
    // if (process.env.NODE_ENV !== "production" && nameOrNames === path) {
    //   throw new Error("Do not pass `path` to `print` function!");
    // }

    // TODO: Remove support for passing `path` in next major version
    if (nameOrNames === path || !nameOrNames) {
      nameOrNames = [];
    }

    const names = Array.isArray(nameOrNames) ? nameOrNames : [nameOrNames];
    const doc = path.call(() => {
      const value = path.getValue();

      const shouldCache =
        value && typeof value === "object" && args === undefined;

      if (shouldCache && cache.has(value)) {
        return cache.get(value);
      }

      const doc = callPluginPrintFunction(
        path,
        options,
        printGenerically,
        args
      );

      // We let JSXElement print its comments itself because it adds () around
      // UnionTypeAnnotation has to align the child without the comments
      if (
        !printer.willPrintOwnComments ||
        !printer.willPrintOwnComments(path, options)
      ) {
        // printComments will call the plugin print function and check for
        // comments to print
        return printComments(path, doc, options);
      }

      if (shouldCache) {
        cache.set(value, doc);
      }

      return doc;
    }, ...names);

    return doc;
  })();

  if (alignmentSize > 0) {
    // Add a hardline to make the indents take effect
    // It should be removed in index.js format()
    doc = addAlignmentToDoc([hardline, doc], alignmentSize, options.tabWidth);
  }
  propagateBreaks(doc);

  return doc;
}

function printPrettierIgnoredNode(node, options) {
  const {
    originalText,
    [Symbol.for("comments")]: comments,
    locStart,
    locEnd,
  } = options;

  const start = locStart(node);
  const end = locEnd(node);

  for (const comment of comments) {
    if (locStart(comment) >= start && locEnd(comment) <= end) {
      comment.printed = true;
    }
  }

  return originalText.slice(start, end);
}

function callPluginPrintFunction(path, options, printPath, args) {
  assert.ok(path instanceof AstPath);

  const node = path.getValue();
  const { printer } = options;

  // Escape hatch
  if (printer.hasPrettierIgnore && printer.hasPrettierIgnore(path)) {
    return printPrettierIgnoredNode(node, options);
  }

  if (node) {
    try {
      // Potentially switch to a different parser
      const sub = multiparser.printSubtree(
        path,
        printPath,
        options,
        printAstToDoc
      );
      if (sub) {
        return sub;
      }
    } catch (error) {
      /* istanbul ignore if */
      if (process.env.PRETTIER_DEBUG) {
        throw error;
      }
      // Continue with current parser
    }
  }

  return printer.print(path, options, printPath, args);
}

module.exports = printAstToDoc;
