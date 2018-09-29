"use strict";

const { mapNode, VOID_TAGS, isWhitespaceOnlyText } = require("./utils");
const LineAndColumn = (m => m.default || m)(require("lines-and-columns"));

const PREPROCESS_PIPELINE = [
  addStartAndEndLocation,
  addIsSelfClosingForVoidTags,
  removeWhitespaceOnlyText
];

function preprocess(ast, options) {
  for (const fn of PREPROCESS_PIPELINE) {
    ast = fn(ast, options);
  }
  return ast;
}

/** add `startLocation` and `endLocation` field */
function addStartAndEndLocation(ast, options) {
  const locator = new LineAndColumn(options.originalText);
  return mapNode(ast, node => {
    const startLocation = locator.locationForIndex(options.locStart(node));
    const endLocation = locator.locationForIndex(options.locEnd(node) - 1);
    return Object.assign({}, node, { startLocation, endLocation });
  });
}

/** add `isSelfClosing` for void tags */
function addIsSelfClosingForVoidTags(ast /*, options */) {
  return mapNode(ast, node => {
    if (node.type === "tag" && node.name in VOID_TAGS) {
      return Object.assign({}, node, { isSelfClosing: true });
    }
    return node;
  });
}

function removeWhitespaceOnlyText(ast /*, options */) {
  return mapNode(ast, node => {
    return !node.children
      ? node
      : Object.assign({}, node, {
          children: node.children.filter(child => !isWhitespaceOnlyText(child))
        });
  });
}

module.exports = preprocess;
