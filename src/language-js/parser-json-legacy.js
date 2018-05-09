"use strict";

const parserBabylon = require("./parser-babylon");
const createError = require("../common/parser-create-error");

function parse(text, parsers, opts) {
  const ast = parserBabylon(
    text,
    parsers,
    Object.assign({}, opts, { parser: "json" })
  );

  ast.comments.forEach(assertJsonNode);
  assertJsonNode(ast);

  return ast;
}

function assertJsonNode(node) {
  switch (node.type) {
    case "ArrayExpression":
      return node.elements.forEach(assertJsonNode);
    case "ObjectExpression":
      return node.properties.forEach(assertJsonNode);
    case "ObjectProperty":
      if (node.computed) {
        throw createJsonError("computed");
      }
      if (node.shorthand) {
        throw createJsonError("shorthand");
      }
      return [node.key, node.value].forEach(assertJsonNode);
    case "UnaryExpression":
      switch (node.operator) {
        case "+":
        case "-":
          return;
        default:
          throw createJsonError("operator");
      }
    case "NullLiteral":
    case "BooleanLiteral":
    case "NumericLiteral":
    case "StringLiteral":
    case "Identifier":
      return;
    default:
      throw createJsonError(node.type);
  }

  function createJsonError(attribute) {
    const name = !attribute
      ? node.type
      : `${node.type} with ${attribute}=${JSON.stringify(node[attribute])}`;
    return createError(`${name} is not allowed in legacy JSON.`, {
      start: {
        line: node.loc.start.line,
        column: node.loc.start.column + 1
      }
    });
  }
}

module.exports = parse;
