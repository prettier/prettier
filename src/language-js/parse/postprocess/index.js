import assert from "node:assert";
import isNonEmptyArray from "../../../utils/is-non-empty-array.js";
import { locEnd, locStart } from "../../loc.js";
import createTypeCheckFunction from "../../utils/create-type-check-function.js";
import getRaw from "../../utils/get-raw.js";
import isBlockComment from "../../utils/is-block-comment.js";
import isIndentableBlockComment from "../../utils/is-indentable-block-comment.js";
import isLineComment from "../../utils/is-line-comment.js";
import isTypeCastComment from "../../utils/is-type-cast-comment.js";
import visitNode from "./visit-node.js";

const isNodeWithRaw = createTypeCheckFunction([
  // Babel
  "RegExpLiteral",
  "BigIntLiteral",
  "NumericLiteral",
  "StringLiteral",
  // "NullLiteral",
  // "BooleanLiteral",
  "DirectiveLiteral",

  // ESTree
  "Literal",
  "JSXText",
  "TemplateElement",

  // Flow
  "StringLiteralTypeAnnotation",
  "NumberLiteralTypeAnnotation",
  "BigIntLiteralTypeAnnotation",
]);

/**
 * @param {{
 *   text: string,
 *   parser?: string,
 * }} options
 */
function postprocess(ast, options) {
  const { parser, text } = options;

  // `InterpreterDirective` from babel parser
  // Other parsers parse it as comment, babel treat it as comment too
  // https://github.com/babel/babel/issues/15116
  if (ast.type === "File" && ast.program.interpreter) {
    const {
      program: { interpreter },
      comments,
    } = ast;
    delete ast.program.interpreter;
    comments.unshift(interpreter);
  }

  // Keep Babel's non-standard ParenthesizedExpression nodes only if they have Closure-style type cast comments.
  if (parser === "babel") {
    const startOffsetsOfTypeCastedNodes = new Set();

    // Comments might be attached not directly to ParenthesizedExpression but to its ancestor.
    // E.g.: /** @type {Foo} */ (foo).bar();
    // Let's use the fact that those ancestors and ParenthesizedExpression have the same start offset.

    ast = visitNode(ast, (node) => {
      if (node.leadingComments?.some(isTypeCastComment)) {
        startOffsetsOfTypeCastedNodes.add(locStart(node));
      }
    });

    ast = visitNode(ast, (node) => {
      if (node.type === "ParenthesizedExpression") {
        const { expression } = node;

        // Align range with `flow`
        if (expression.type === "TypeCastExpression") {
          expression.range = [...node.range];
          return expression;
        }

        const start = locStart(node);
        if (!startOffsetsOfTypeCastedNodes.has(start)) {
          expression.extra = { ...expression.extra, parenthesized: true };
          return expression;
        }
      }
    });
  }

  ast = visitNode(ast, (node) => {
    switch (node.type) {
      case "LogicalExpression":
        // We remove unneeded parens around same-operator LogicalExpressions
        if (isUnbalancedLogicalTree(node)) {
          return rebalanceLogicalTree(node);
        }
        break;

      case "TemplateElement":
        // `flow` and `typescript` follows the `espree` style positions
        // https://github.com/eslint/js/blob/5826877f7b33548e5ba984878dd4a8eac8448f87/packages/espree/lib/espree.js#L213
        if (
          parser === "flow" ||
          parser === "espree" ||
          parser === "typescript"
        ) {
          const start = locStart(node) + 1;
          const end = locEnd(node) - (node.tail ? 1 : 2);

          node.range = [start, end];
        }
        break;

      // fix unexpected locEnd caused by --no-semi style
      case "VariableDeclaration": {
        const lastDeclaration = node.declarations.at(-1);
        if (lastDeclaration?.init && text[locEnd(lastDeclaration)] !== ";") {
          node.range = [locStart(node), locEnd(lastDeclaration)];
        }
        break;
      }
      // remove redundant TypeScript nodes
      case "TSParenthesizedType":
        return node.typeAnnotation;

      case "TSTypeParameter":
        // babel-ts
        if (typeof node.name === "string") {
          const start = locStart(node);
          node.name = {
            type: "Identifier",
            name: node.name,
            range: [start, start + node.name.length],
          };
        }
        break;

      // For hack-style pipeline
      case "TopicReference":
        ast.extra = { ...ast.extra, __isUsingHackPipeline: true };
        break;

      // In Flow parser, it doesn't generate union/intersection types for single type
      case "TSUnionType":
      case "TSIntersectionType":
        if (node.types.length === 1) {
          return node.types[0];
        }
        break;
    }

    /* c8 ignore next 3 */
    if (process.env.NODE_ENV !== "production") {
      assertRaw(node, text);
    }
  });

  if (isNonEmptyArray(ast.comments)) {
    let followingComment;
    for (let i = ast.comments.length - 1; i >= 0; i--) {
      const comment = ast.comments[i];

      if (
        followingComment &&
        locEnd(comment) === locStart(followingComment) &&
        isBlockComment(comment) &&
        isBlockComment(followingComment) &&
        isIndentableBlockComment(comment) &&
        isIndentableBlockComment(followingComment)
      ) {
        ast.comments.splice(i + 1, 1);
        comment.value += "*//*" + followingComment.value;
        comment.range = [locStart(comment), locEnd(followingComment)];
      }

      if (!isLineComment(comment) && !isBlockComment(comment)) {
        throw new TypeError(`Unknown comment type: "${comment.type}".`);
      }

      /* c8 ignore next 3 */
      if (process.env.NODE_ENV !== "production") {
        assertComment(comment, text);
      }

      followingComment = comment;
    }
  }

  // In `typescript`/`espree`/`flow`, `Program` doesn't count whitespace and comments
  // See https://github.com/eslint/espree/issues/488
  if (ast.type === "Program") {
    ast.range = [0, text.length];
  }
  return ast;
}

function isUnbalancedLogicalTree(node) {
  return (
    node.type === "LogicalExpression" &&
    node.right.type === "LogicalExpression" &&
    node.operator === node.right.operator
  );
}

function rebalanceLogicalTree(node) {
  if (!isUnbalancedLogicalTree(node)) {
    return node;
  }

  return rebalanceLogicalTree({
    type: "LogicalExpression",
    operator: node.operator,
    left: rebalanceLogicalTree({
      type: "LogicalExpression",
      operator: node.operator,
      left: node.left,
      right: node.right.left,
      range: [locStart(node.left), locEnd(node.right.left)],
    }),
    right: node.right.right,
    range: [locStart(node), locEnd(node)],
  });
}

/* c8 ignore next */
function assertComment(comment, text) {
  const commentText = text.slice(locStart(comment), locEnd(comment));

  if (isLineComment(comment)) {
    const openingMark = text.slice(
      0,
      text.startsWith("<--") || text.startsWith("-->") ? 3 : 2,
    );
    assert.ok(openingMark + comment.value, commentText);
    return;
  }

  if (isBlockComment(comment)) {
    // Flow
    const closingMark = commentText.endsWith("*-/") ? "*-/" : "*/";
    assert.equal("/*" + comment.value + closingMark, commentText);
  }
}

/* c8 ignore next */
function assertRaw(node, text) {
  if (!isNodeWithRaw(node)) {
    return;
  }

  const raw = node.type === "TemplateElement" ? node.value.raw : getRaw(node);
  assert.equal(raw, text.slice(locStart(node), locEnd(node)));
}

export default postprocess;
