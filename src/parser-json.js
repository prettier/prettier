"use strict";

const createError = require("./parser-create-error");

function parse(text) {
  const jsonToAst = require("json-to-ast");
  try {
    const ast = jsonToAst(text);
    toBabylon(ast);
    return ast;
  } catch (err) {
    const firstNewlineIndex = err.message.indexOf("\n");
    const firstLine = err.message.slice(0, firstNewlineIndex);
    const lastSpaceIndex = firstLine.lastIndexOf(" ");
    const message = firstLine.slice(0, lastSpaceIndex);
    const locString = firstLine.slice(lastSpaceIndex + 1);
    const lineCol = locString.split(":").map(Number);

    throw createError("(json-to-ast) " + message, {
      start: {
        line: lineCol[0],
        column: lineCol[1]
      }
    });
  }
}

function toBabylon(node) {
  node.start = node.loc.start.offset;
  node.end = node.loc.end.offset;

  const typeMap = {
    object: "ObjectExpression",
    property: "ObjectProperty",
    identifier: "json-identifier",
    array: "ArrayExpression",
    literal: "json-literal"
  };

  node.type = typeMap[node.type];
  (node.children || []).forEach(toBabylon);

  switch (node.type) {
    case "ObjectExpression":
      node.properties = node.children;
      break;
    case "ObjectProperty":
      toBabylon(node.key);
      toBabylon(node.value);
      break;
    case "ArrayExpression":
      node.elements = node.children;
      break;
  }

  delete node.children;
}

module.exports = parse;
