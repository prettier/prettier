"use strict";

const assert = require("assert");
const comments = require("./comments");
const FastPath = require("../common/fast-path");
const multiparser = require("./multiparser");

const doc = require("../doc");
const docBuilders = doc.builders;
const concat = docBuilders.concat;
const hardline = docBuilders.hardline;
const addAlignmentToDoc = docBuilders.addAlignmentToDoc;
const docUtils = doc.utils;

function printAstToDoc(ast, options, addAlignmentSize = 0) {
  const printer = options.printer;

  if (printer.preprocess) {
    ast = printer.preprocess(ast, options);
  }

  const cache = new Map();

  function printGenerically(path, args) {
    const node = path.getValue();

    const shouldCache = node && typeof node === "object" && args === undefined;
    if (shouldCache && cache.has(node)) {
      return cache.get(node);
    }

    // We let JSXElement print its comments itself because it adds () around
    // UnionTypeAnnotation has to align the child without the comments
    let res;
    if (printer.willPrintOwnComments && printer.willPrintOwnComments(path)) {
      res = genericPrint(path, options, printGenerically, args);
    } else {
      res = comments.printComments(
        path,
        p => genericPrint(p, options, printGenerically, args),
        options,
        args && args.needsSemi
      );
    }

    if (shouldCache) {
      cache.set(node, res);
    }

    return res;
  }

  let doc = printGenerically(new FastPath(ast));
  if (addAlignmentSize > 0) {
    // Add a hardline to make the indents take effect
    // It should be removed in index.js format()
    doc = addAlignmentToDoc(
      docUtils.removeLines(concat([hardline, doc])),
      addAlignmentSize,
      options.tabWidth
    );
  }
  docUtils.propagateBreaks(doc);

  return doc;
}

function genericPrint(path, options, printPath, args) {
  assert.ok(path instanceof FastPath);

  const node = path.getValue();
  const printer = options.printer;

  // Escape hatch
  if (printer.hasPrettierIgnore && printer.hasPrettierIgnore(path)) {
    return options.originalText.slice(
      options.locStart(node),
      options.locEnd(node)
    );
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
