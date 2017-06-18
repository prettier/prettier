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

  const result = {
    type: typeMap[node.type],
    start: node.loc.start.offset,
    end: node.loc.end.offset,
    loc: node.loc
  };

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
    case "literal": {
      const constructorTypes = {
        String: "StringLiteral",
        Number: "NumericLiteral",
        Boolean: "BooleanLiteral"
      };

      const value = JSON.parse(node.rawValue);
      const type = value === null
        ? "NullLiteral"
        : constructorTypes[value.constructor.name];

      return Object.assign(result, {
        type: type,
        value: value,
        extra: { raw: node.rawValue }
      });
    }
  }
}

module.exports = parse;
