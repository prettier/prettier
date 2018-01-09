"use strict";

const normalize = require("./options").normalize;
const comments = require("./comments");

function printSubtree(path, print, options) {
  if (options.printer.embed) {
    return options.printer.embed(
      path,
      print,
      (text, partialNextOptions) =>
        textToDoc(text, partialNextOptions, options),
      options
    );
  }
}

function textToDoc(text, partialNextOptions, parentOptions) {
  const nextOptions = normalize(
    Object.assign({}, parentOptions, partialNextOptions, {
      parentParser: parentOptions.parser,
      originalText: text
    })
  );

  const result = require("./parser").parse(text, nextOptions);
  const ast = result.ast;
  text = result.text;

  const astComments = ast.comments;
  delete ast.comments;
  comments.attach(astComments, ast, text, nextOptions);
  return require("./ast-to-doc")(ast, nextOptions);
}

module.exports = {
  printSubtree
};
