import AstPath from "../common/ast-path.js";
import { hardline, addAlignmentToDoc } from "../document/builders.js";
import { propagateBreaks } from "../document/utils.js";
import { printComments } from "./comments.js";
import { printEmbeddedLanguages } from "./multiparser.js";
import createPrintPreCheckFunction from "./create-print-pre-check-function.js";

/**
 * Takes an abstract syntax tree (AST) and recursively converts it to a
 * document (series of printing primitives).
 *
 * This is done by descending down the AST recursively. The recursion
 * involves two functions that call each other:
 *
 * 1. mainPrint(), which is defined as an inner function here.
 *    It basically takes care of node caching.
 * 2. callPluginPrintFunction(), which checks for some options, and
 *    ultimately calls the print() function provided by the plugin.
 *
 * The plugin function will call mainPrint() again for child nodes
 * of the current node. mainPrint() will do its housekeeping, then call
 * the plugin function again, and so on.
 *
 * All the while, these functions pass a "path" variable around, which
 * is a stack-like data structure (AstPath) that maintains the current
 * state of the recursion. It is called "path", because it represents
 * the path to the current node through the Abstract Syntax Tree.
 */
async function printAstToDoc(ast, options, alignmentSize = 0) {
  const { printer } = options;

  if (printer.preprocess) {
    ast = await printer.preprocess(ast, options);
  }

  const cache = new Map();
  const path = new AstPath(ast);

  const ensurePrintingNode = createPrintPreCheckFunction(options);
  const embeds = new Map();

  await printEmbeddedLanguages(path, mainPrint, options, printAstToDoc, embeds);

  // Only the root call of the print method is awaited.
  // This is done to make things simpler for plugins that don't use recursive printing.
  let doc = await callPluginPrintFunction(
    path,
    options,
    mainPrint,
    undefined,
    embeds
  );

  if (alignmentSize > 0) {
    // Add a hardline to make the indents take effect
    // It should be removed in index.js format()
    doc = addAlignmentToDoc([hardline, doc], alignmentSize, options.tabWidth);
  }

  propagateBreaks(doc);

  return doc;

  function mainPrint(selector, args) {
    if (selector === undefined || selector === path) {
      return mainPrintInternal(args);
    }

    if (Array.isArray(selector)) {
      return path.call(() => mainPrintInternal(args), ...selector);
    }

    return path.call(() => mainPrintInternal(args), selector);
  }

  function mainPrintInternal(args) {
    ensurePrintingNode(path);

    const value = path.getValue();

    if (value === undefined || value === null) {
      return "";
    }

    const shouldCache =
      value && typeof value === "object" && args === undefined;

    if (shouldCache && cache.has(value)) {
      return cache.get(value);
    }

    const doc = callPluginPrintFunction(path, options, mainPrint, args, embeds);

    if (shouldCache) {
      cache.set(value, doc);
    }

    return doc;
  }
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
  const printedComments = new Set();

  for (const comment of comments) {
    if (locStart(comment) >= start && locEnd(comment) <= end) {
      comment.printed = true;
      printedComments.add(comment);
    }
  }

  return { doc: originalText.slice(start, end), printedComments };
}

function callPluginPrintFunction(path, options, printPath, args, embeds) {
  const node = path.getValue();
  const { printer } = options;

  let doc;
  let printedComments;

  // Escape hatch
  if (printer.hasPrettierIgnore && printer.hasPrettierIgnore(path)) {
    ({ doc, printedComments } = printPrettierIgnoredNode(node, options));
  } else if (embeds.has(node)) {
    doc = embeds.get(node);
  } else {
    doc = printer.print(path, options, printPath, args);
  }

  // We let JSXElement print its comments itself because it adds () around
  // UnionTypeAnnotation has to align the child without the comments
  if (
    !printer.willPrintOwnComments ||
    !printer.willPrintOwnComments(path, options)
  ) {
    // printComments will call the plugin print function and check for
    // comments to print
    doc = printComments(path, doc, options, printedComments);
  }

  return doc;
}

export default printAstToDoc;
