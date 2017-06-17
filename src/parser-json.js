"use strict";

const createError = require("./parser-create-error");

function parse(text) {
  const jsonToAst = require("json-to-ast");
  try {
    const ast = jsonToAst(text);
    return toBabylon(ast);
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
  const typeMap = {
    object: "ObjectExpression",
    property: "ObjectProperty",
    identifier: "json-identifier",
    array: "ArrayExpression"
  };

  const untypedResult = {
    start: node.loc.start.offset,
    end: node.loc.end.offset,
    loc: node.loc
  };

  const result = Object.assign({}, untypedResult, {
    type: typeMap[node.type]
  });

  switch (node.type) {
    case "object":
      return Object.assign(result, {
        properties: node.children.map(toBabylon)
      });
    case "property":
      return Object.assign(result, {
        key: toBabylon(node.key),
        value: toBabylon(node.value)
      });
    case "identifier":
      return Object.assign(result, {
        value: node.value
      });
    case "array":
      return Object.assign(result, {
        elements: node.children.map(toBabylon)
      });
    case "literal":
      return Object.assign(
        require("./parser-babylon")(node.rawValue, {
          parseExpression: true
        }),
        untypedResult,
        {
          __prettier__isJson: true
        }
      );
  }
}

module.exports = parse;
