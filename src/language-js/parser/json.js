"use strict";

const createError = require("../../common/parser-create-error");
const createParser = require("./create-parser");
const createBabelParseError = require("./create-babel-parse-error");

function createJsonParse(options = {}) {
  const { allowComments = true } = options;

  return function parse(text /*, parsers, options*/) {
    let ast;
    try {
      ast = require("@babel/parser").parseExpression(text, {
        tokens: true,
        ranges: true,
      });
    } catch (error) {
      throw createBabelParseError(error);
    }

    if (!allowComments) {
      // @ts-ignore
      for (const comment of ast.comments) {
        assertJsonNode(comment);
      }
    }

    assertJsonNode(ast);

    return ast;
  };
}

function assertJsonNode(node, parent) {
  switch (node.type) {
    case "ArrayExpression":
      for (const element of node.elements) {
        if (element === null) {
          throw createError("Sparse array is not allowed in JSON.", {
            start: {
              line: node.loc.start.line,
              column: node.loc.start.column + 1,
            },
          });
        }

        assertJsonChildNode(element);
      }
      return;
    case "ObjectExpression":
      for (const property of node.properties) {
        assertJsonChildNode(property);
      }
      return;
    case "ObjectProperty":
      if (node.computed) {
        throw createJsonError("computed");
      }

      if (node.shorthand) {
        throw createJsonError("shorthand");
      }

      assertJsonChildNode(node.key);
      assertJsonChildNode(node.value);
      return;
    case "UnaryExpression":
      switch (node.operator) {
        case "+":
        case "-":
          return assertJsonChildNode(node.argument);
        default:
          throw createJsonError("operator");
      }
    case "Identifier":
      if (parent && parent.type === "ObjectProperty" && parent.key === node) {
        return;
      }
      throw createJsonError();
    case "NullLiteral":
    case "BooleanLiteral":
    case "NumericLiteral":
    case "StringLiteral":
      return;
    default:
      throw createJsonError();
  }

  function assertJsonChildNode(child) {
    return assertJsonNode(child, node);
  }

  function createJsonError(attribute) {
    const name = !attribute
      ? node.type
      : `${node.type} with ${attribute}=${JSON.stringify(node[attribute])}`;
    return createError(`${name} is not allowed in JSON.`, {
      start: {
        line: node.loc.start.line,
        column: node.loc.start.column + 1,
      },
    });
  }
}

const parseJson = createJsonParse();

const jsonParsers = {
  json: createParser({
    parse: parseJson,
    hasPragma() {
      return true;
    },
  }),
  json5: createParser(parseJson),
  "json-stringify": createParser({
    parse: createJsonParse({ allowComments: false }),
    astFormat: "estree-json",
  }),
};

module.exports = jsonParsers;
