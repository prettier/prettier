"use strict";

const parserBabylon = eval("require")("./parser-babylon");
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
      // istanbul ignore if
      if (node.computed) {
        throw createJsonError("computed");
      }
      // istanbul ignore if
      if (node.shorthand) {
        throw createJsonError("shorthand");
      }
      return [node.key, node.value].forEach(assertJsonNode);
    case "UnaryExpression":
      switch (node.operator) {
        case "+":
        case "-":
          return assertJsonNode(node.argument);
        // istanbul ignore next
        default:
          throw createJsonError("operator");
      }
    case "NullLiteral":
    case "BooleanLiteral":
    case "NumericLiteral":
    case "StringLiteral":
    case "Identifier":
      return;
    // istanbul ignore next
    default:
      throw createJsonError(node.type);
  }

  // istanbul ignore next
  function createJsonError(attribute) {
    const name = !attribute
      ? node.type
      : `${node.type} with ${attribute}=${JSON.stringify(node[attribute])}`;
    return createError(`${name} is not allowed in JSON.`, {
      start: {
        line: node.loc.start.line,
        column: node.loc.start.column + 1
      }
    });
  }
}

module.exports = parse;
