"use strict";

const comments = require("./comments");

function printSubtree(printer, path, print, options) {
  if (printer.embed) {
    return printer.embed(path, print, createTextToDoc(options), options);
  }
}

function createTextToDoc(parentOptions) {
  return function textToDoc(text, partialNextOptions) {
    const nextOptions = Object.assign({}, parentOptions, partialNextOptions, {
      parentParser: parentOptions.parser,
      originalText: text
    });
    if (nextOptions.parser === "json") {
      nextOptions.trailingComma = "none";
    }

    const ast = require("./parser").parse(text, nextOptions);
    const astComments = ast.comments;
    delete ast.comments;
    comments.attach(astComments, ast, text, nextOptions);
    return require("./ast-to-doc")(ast, nextOptions);
  };
}

function fromVue(path, print, options) {
  const node = path.getValue();
  const parent = path.getParentNode();
  if (!parent || parent.tag !== "root") {
    return null;
  }

  let parser;

  if (node.tag === "style") {
    const langAttr = node.attrs.find(attr => attr.name === "lang");
    if (!langAttr) {
      parser = "css";
    } else if (langAttr.value === "scss") {
      parser = "scss";
    } else if (langAttr.value === "less") {
      parser = "less";
    } else {
      return null;
    }
  }

  if (node.tag === "script") {
    const langAttr = node.attrs.find(attr => attr.name === "lang");
    if (!langAttr) {
      parser = "babylon";
    } else if (langAttr.value === "ts") {
      parser = "typescript";
    } else {
      return null;
    }
  }

  return concat([
    options.originalText.slice(node.start, node.contentStart),
    hardline,
    parseAndPrint(
      options.originalText.slice(node.contentStart, node.contentEnd),
      parser,
      options
    ),
    options.originalText.slice(node.contentEnd, node.end)
  ]);
}

module.exports = {
  printSubtree
};
