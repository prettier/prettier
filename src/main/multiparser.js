"use strict";

const comments = require("./comments");

function printSubtree(printer, path, print, options, plugins) {
  if (printer.embed) {
    return printer.embed(
      path,
      print,
      (text, partialNextOptions) =>
        textToDoc(text, partialNextOptions, options, plugins),
      options
    );
  }
}

function textToDoc(text, partialNextOptions, parentOptions, plugins) {
  const nextOptions = Object.assign({}, parentOptions, partialNextOptions, {
    parentParser: parentOptions.parser,
    originalText: text
  });
  if (nextOptions.parser === "json") {
    nextOptions.trailingComma = "none";
  }

  const ast = require("./parser").parse(text, nextOptions, plugins);
  const astComments = ast.comments;
  delete ast.comments;
  comments.attach(astComments, ast, text, nextOptions);
  return require("./ast-to-doc")(ast, nextOptions, plugins);
}

module.exports = {
  printSubtree
};
