import { parseExpression } from "@babel/parser";
import createError from "../common/parser-create-error.js";
import createBabelParseError from "../language-js/parse/utils/create-babel-parse-error.js";
import createParser from "../language-js/parse/utils/create-parser.js";
import wrapBabelExpression from "../language-js/parse/utils/wrap-babel-expression.js";
import isNonEmptyArray from "../utils/is-non-empty-array.js";

function createJsonParse(options = {}) {
  const { allowComments = true } = options;

  return function parse(text) {
    let ast;
    try {
      ast = parseExpression(text, {
        tokens: true,
        ranges: true,
        attachComment: false,
      });
    } catch (/** @type {any} */ error) {
      throw createBabelParseError(error);
    }

    // @ts-expect-error
    if (!allowComments && isNonEmptyArray(ast.comments)) {
      // @ts-expect-error
      throw createJsonError(ast.comments[0], "Comment");
    }

    assertJsonNode(ast);

    return wrapBabelExpression(ast, { type: "JsonRoot", text });
  };
}

function createJsonError(node, description) {
  const [start, end] = [node.loc.start, node.loc.end].map(
    ({ line, column }) => ({
      line,
      column: column + 1,
    }),
  );
  return createError(`${description} is not allowed in JSON.`, {
    loc: { start, end },
  });
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
    case "UnaryExpression": {
      const { operator, argument } = node;
      if (operator !== "+" && operator !== "-") {
        throw createJsonError(node, `Operator '${node.operator}'`);
      }

      if (
        argument.type === "NumericLiteral" ||
        (argument.type === "Identifier" &&
          (argument.name === "Infinity" || argument.name === "NaN"))
      ) {
        return;
      }

      throw createJsonError(
        argument,
        `Operator '${operator}' before '${argument.type}'`,
      );
    }
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
          "'TemplateLiteral' with expression",
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
      throw createJsonError(node, `'${node.type}'`);
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
  jsonc: createParser(parseJson),
  "json-stringify": createParser({
    parse: createJsonParse({ allowComments: false }),
    astFormat: "estree-json",
  }),
};

export default jsonParsers;
