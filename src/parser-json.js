"use strict";

function parse(text) {
  const jsonToAst = require("json-to-ast");
  const ast = jsonToAst(text);
  toBabylon(ast);
  return ast;
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
