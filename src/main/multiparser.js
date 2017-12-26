"use strict";

const comments = require("./comments");

function printSubtree(printer, path, print, options) {
  if (printer.embed) {
    return printer.embed(
      path,
      print,
      (text, partialNextOptions) =>
        textToDoc(text, partialNextOptions, options),
      options
    );
  }
}

function textToDoc(text, partialNextOptions, parentOptions) {
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
}

module.exports = {
  printSubtree
};
