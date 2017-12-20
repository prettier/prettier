"use strict";

const assert = require("assert");
const comments = require("../main/comments");
const FastPath = require("../builder/fast-path");
const multiparser = require("../main/multiparser");
const util = require("../builder/util");

const docBuilders = require("../builder/doc-builders");
const concat = docBuilders.concat;
const hardline = docBuilders.hardline;
const addAlignmentToDoc = docBuilders.addAlignmentToDoc;
const docUtils = require("../builder/doc-utils");

function getPrinter(options) {
  switch (options.parser) {
    case "graphql":
      return require("../language-graphql/printer-graphql");
    case "parse5":
      return require("../language-html/printer-htmlparser2");
    case "css":
    case "less":
    case "scss":
      return require("../language-css/printer-postcss");
    case "markdown":
      return require("../language-markdown/printer-markdown");
    default:
      return require("../language-js/printer-estree");
  }
}

function printAstToDoc(ast, options, addAlignmentSize) {
  addAlignmentSize = addAlignmentSize || 0;

  const printer = getPrinter(options);
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
      res = genericPrint(path, options, printer, printGenerically, args);
    } else {
      res = comments.printComments(
        path,
        p => genericPrint(p, options, printer, printGenerically, args),
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

  if (options.parser === "json") {
    doc = concat([doc, hardline]);
  }

  return doc;
}

function genericPrint(path, options, printer, printPath, args) {
  assert.ok(path instanceof FastPath);

  const node = path.getValue();

  // Escape hatch
  if (util.hasIgnoreComment(path)) {
    return options.originalText.slice(util.locStart(node), util.locEnd(node));
  }

  if (node) {
    try {
      // Potentially switch to a different parser
      const sub = multiparser.printSubtree(path, printPath, options);
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

module.exports = { printAstToDoc };
