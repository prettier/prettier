"use strict";

const { isNonEmptyArray } = require("../../common/util");
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

    // @ts-ignore
    if (!allowComments && isNonEmptyArray(ast.comments)) {
      // @ts-ignore
      throw createJsonError(ast.comments[0], "Comment");
    }

    assertJsonNode(ast);

    return ast;
  };
}

function createJsonError(node, description) {
  const [start, end] = [node.loc.start, node.loc.end].map(
    ({ line, column }) => ({
      line,
      column: column + 1,
    })
  );
  return createError(`${description} is not allowed in JSON.`, { start, end });
}

function assertJsonNode(node) {
  switch (node.type) {
    case "ArrayExpression":
      for (const element of node.elements) {
        if (element !== null) {
          assertJsonNode(element);
        }
      }

      return;
    case "ObjectExpression":
      for (const property of node.properties) {
        assertJsonNode(property);
      }

      return;
    case "ObjectProperty":
      if (node.computed) {
        throw createJsonError(node.key, "Computed key");
      }

      if (node.shorthand) {
        throw createJsonError(node.key, "Shorthand property");
      }

      if (node.key.type !== "Identifier") {
        assertJsonNode(node.key);
      }

      assertJsonNode(node.value);

      return;
<<<<<<< HEAD
    case "UnaryExpression": {
      if (node.operator !== "+" && node.operator !== "-") {
        throw createJsonError("operator");
      }

      if (node.argument.type !== "NumericLiteral") {
        throw createJsonError("argument");
      }

      return;
    }
=======
    case "UnaryExpression":
      if (node.operator !== "+" && node.operator !== "-") {
        throw createJsonError(node, `Operator '${node.operator}'`);
      }

      assertJsonNode(node.argument);

      return;
>>>>>>> main
    case "Identifier":
      if (
        // JSON5 https://spec.json5.org/#numbers
        node.name !== "Infinity" &&
        node.name !== "NaN" &&
        // JSON6 https://github.com/d3x0r/JSON6
        node.name !== "undefined"
      ) {
        throw createJsonError(node, `Identifier '${node.name}'`);
      }

      return;
    case "TemplateLiteral":
      if (isNonEmptyArray(node.expressions)) {
        throw createJsonError(
          node.expressions[0],
          "'TemplateLiteral' with expression"
        );
      }

      for (const element of node.quasis) {
        assertJsonNode(element);
      }

      return;
    case "NullLiteral":
    case "BooleanLiteral":
    case "NumericLiteral":
    case "StringLiteral":
    case "TemplateElement":
      return;
    default:
<<<<<<< HEAD
      throw createJsonError();
  }

  function assertJsonChildNode(child) {
    return assertJsonNode(child, node);
  }

  function createJsonError(property) {
    let description = node.type;
    if (property) {
      let value = node[property];

      if (value && value.type) {
        value = value.type;
      }

      description += ` with ${property}=${JSON.stringify(value)}`;
    }
    return createError(`${description} is not allowed in JSON.`, {
      start: {
        line: node.loc.start.line,
        column: node.loc.start.column + 1,
      },
    });
=======
      throw createJsonError(node, `'${node.type}'`);
>>>>>>> main
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
