import { parse, parseExpression } from "@babel/parser";
import createError from "../../common/parser-create-error.js";
import createBabelParseError from "../../language-js/parse/utilities/create-babel-parse-error.js";
import wrapExpression from "../../language-js/parse/utilities/wrap-expression.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";

const babelParseOptions = {
  tokens: false,
  // Ranges not available on comments, so we use `Node#{start,end}` instead
  // https://github.com/babel/babel/issues/15115
  ranges: false,
  attachComment: false,
  createParenthesizedExpressions: true,
};

function parseEmptyJson(text) {
  const file = parse(text, babelParseOptions);

  const { program } = file;

  // Not an empty JSON
  /* c8 ignore next */
  if (
    !(
      program.body.length === 0 &&
      program.directives.length === 0 &&
      !program.interpreter
    )
  ) {
    return;
  }

  return file.comments;
}

function parseJson(text, options = {}) {
  const { allowComments = true, allowEmpty = false } = options;

  let ast;
  let comments;
  try {
    ast = parseExpression(text, babelParseOptions);
    comments = ast.comments;
  } catch (/** @type {any} */ error) {
    if (
      allowEmpty &&
      error.code === "BABEL_PARSER_SYNTAX_ERROR" &&
      error.reasonCode === "ParseExpressionEmptyInput"
    ) {
      try {
        comments = parseEmptyJson(text);
      } catch {
        // No op
      }
    }

    if (!ast && !comments) {
      throw createBabelParseError(error);
    }
  }

  if (!allowComments && isNonEmptyArray(comments)) {
    throw createJsonError(comments[0], "Comment");
  }

  ast = wrapExpression({ type: "JsonRoot", expression: ast, comments, text });

  assertJsonNode(ast.node);

  return ast;
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

export { parseJson };
