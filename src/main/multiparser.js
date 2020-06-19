"use strict";

const { normalize } = require("./options");
const comments = require("./comments");
const {
  utils: { stripTrailingHardline },
} = require("../document");

function printSubtree(path, print, options, printAstToDoc) {
  if (options.printer.embed && options.embeddedLanguageFormatting === "auto") {
    return options.printer.embed(
      path,
      print,
      (text, partialNextOptions, textToDocOptions) =>
        textToDoc(
          text,
          partialNextOptions,
          options,
          printAstToDoc,
          textToDocOptions
        ),
      options
    );
  }
}

function textToDoc(
  text,
  partialNextOptions,
  parentOptions,
  printAstToDoc,
  // TODO: remove `stripTrailingHardline` in v3.0.0
  { stripTrailingHardline: shouldStripTrailingHardline = false } = {}
) {
  const nextOptions = normalize(
    {
      ...parentOptions,
      ...partialNextOptions,
      parentParser: parentOptions.parser,
      embeddedInHtml: !!(
        parentOptions.embeddedInHtml ||
        parentOptions.parser === "html" ||
        parentOptions.parser === "vue" ||
        parentOptions.parser === "angular" ||
        parentOptions.parser === "lwc"
      ),
      originalText: text,
    },
    { passThrough: true }
  );

  const result = require("./parser").parse(text, nextOptions);
  const { ast } = result;
  text = result.text;

  const astComments = ast.comments;
  delete ast.comments;
  comments.attach(astComments, ast, text, nextOptions);
  const doc = printAstToDoc(ast, nextOptions);
  return shouldStripTrailingHardline ? stripTrailingHardline(doc, true) : doc;
}

module.exports = {
  printSubtree,
};
