import AstPath from "../common/ast-path.js";
import { cursor } from "../document/builders.js";
import { inheritLabel } from "../document/utils.js";
import { attachComments } from "./comments/attach.js";
import { ensureAllCommentsPrinted, printComments } from "./comments/print.js";
import createPrintPreCheckFunction from "./create-print-pre-check-function.js";
import { printEmbeddedLanguages } from "./multiparser.js";
import printIgnored from "./print-ignored.js";

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
async function printAstToDoc(ast, options) {
  ({ ast } = await prepareToPrint(ast, options));

  const cache = new Map();
  const path = new AstPath(ast);

  const ensurePrintingNode = createPrintPreCheckFunction(options);
  const embeds = new Map();

  await printEmbeddedLanguages(path, mainPrint, options, printAstToDoc, embeds);

  // Only the root call of the print method is awaited.
  // This is done to make things simpler for plugins that don't use recursive printing.
  const doc = await callPluginPrintFunction(
    path,
    options,
    mainPrint,
    undefined,
    embeds,
  );

  ensureAllCommentsPrinted(options);

  if (options.nodeAfterCursor && !options.nodeBeforeCursor) {
    return [cursor, doc];
  }
  if (options.nodeBeforeCursor && !options.nodeAfterCursor) {
    return [doc, cursor];
  }

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

    const value = path.node;

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

function callPluginPrintFunction(path, options, printPath, args, embeds) {
  const { node } = path;
  const { printer } = options;

  let doc;

  // Escape hatch
  if (printer.hasPrettierIgnore?.(path)) {
    doc = printIgnored(path, options);
  } else if (embeds.has(node)) {
    doc = embeds.get(node);
  } else {
    doc = printer.print(path, options, printPath, args);
  }

  switch (node) {
    case options.cursorNode:
      doc = inheritLabel(doc, (doc) => [cursor, doc, cursor]);
      break;
    case options.nodeBeforeCursor:
      doc = inheritLabel(doc, (doc) => [doc, cursor]);
      break;
    case options.nodeAfterCursor:
      doc = inheritLabel(doc, (doc) => [cursor, doc]);
      break;
  }

  // We let JSXElement print its comments itself because it adds () around
  // UnionTypeAnnotation has to align the child without the comments
  if (
    printer.printComment &&
    (!printer.willPrintOwnComments ||
      !printer.willPrintOwnComments(path, options))
  ) {
    // printComments will call the plugin print function and check for
    // comments to print
    doc = printComments(path, doc, options);
  }

  return doc;
}

async function prepareToPrint(ast, options) {
  const comments = ast.comments ?? [];
  options[Symbol.for("comments")] = comments;
  options[Symbol.for("tokens")] = ast.tokens ?? [];
  // For JS printer to ignore attached comments
  options[Symbol.for("printedComments")] = new Set();

  attachComments(ast, options);

  const {
    printer: { preprocess },
  } = options;

  ast = preprocess ? await preprocess(ast, options) : ast;

  return { ast, comments };
}

export { prepareToPrint, printAstToDoc };
