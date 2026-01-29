import * as assert from "#universal/assert";
import { commentsPropertyInOptions } from "../../../constants.js";
import { locEnd, locEndWithFullText, locStart } from "../../loc.js";
import { createTypeCheckFunction } from "../../utilities/create-type-check-function.js";
import { getRaw } from "../../utilities/get-raw.js";
import { getTextWithoutComments } from "../../utilities/get-text-without-comments.js";
import { isBlockComment } from "../../utilities/is-block-comment.js";
import { isLineComment } from "../../utilities/is-line-comment.js";
import { isTypeCastComment } from "../../utilities/is-type-cast-comment.js";
import { mergeNestledJsdocComments } from "./merge-nestled-jsdoc-comments.js";
import visitNode from "./visit-node.js";

/**
@import {Node, Comment} from "../../types/estree.js"
*/

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
 *   astType?: "espree" | "flow" | "hermes" | "meriyah" | "oxc-js" | "oxc-ts" | "typescript",
 * }} options
 */
function postprocess(ast, options) {
  const { text, astType } = options;
  const isOxcTs = astType === "oxc-ts";
  const { comments } = ast;

  mergeNestledJsdocComments(comments);

  // `InterpreterDirective` from babel parser and flow parser
  // Other parsers parse it as comment, babel treat it as comment too
  // https://github.com/babel/babel/issues/15116
  const program = ast.type === "File" ? ast.program : ast;
  if (program.interpreter) {
    comments.unshift(program.interpreter);
    delete program.interpreter;
  }

  if (ast.hashbang) {
    if (isOxcTs) {
      comments.unshift(ast.hashbang);
    }
    delete ast.hashbang;
  }

  // In `typescript` and `flow`, `Program` doesn't count whitespace and comments
  // See https://github.com/typescript-eslint/typescript-eslint/issues/11026
  // See https://github.com/facebook/flow/issues/8537
  if (ast.type === "Program") {
    ast.range = [0, text.length];
  }

  let typeCastCommentsEnds;

  ast = visitNode(ast, {
    onEnter(node) {
      switch (node.type) {
        case "ParenthesizedExpression": {
          const { expression } = node;
          const start = locStart(node);

          // Align range with `flow`
          if (expression.type === "TypeCastExpression") {
            expression.range = [start, locEnd(node)];
            return expression;
          }

          let shouldKeepParenthesizedExpression = false;
          if (!isOxcTs) {
            if (!typeCastCommentsEnds) {
              typeCastCommentsEnds = [];

              for (const comment of comments) {
                if (isTypeCastComment(comment)) {
                  typeCastCommentsEnds.push(locEnd(comment));
                }
              }
            }

            // Keep ParenthesizedExpression nodes only if they have Closure-style type cast comments.
            const previousCommentEnd = typeCastCommentsEnds.findLast(
              (end) => end <= start,
            );
            shouldKeepParenthesizedExpression =
              previousCommentEnd &&
              // check that there are only white spaces between the comment and the parenthesis
              text.slice(previousCommentEnd, start).trim().length === 0;
          }

          if (shouldKeepParenthesizedExpression) {
            return;
          }

          expression.extra = { ...expression.extra, parenthesized: true };
          return expression;
        }

        // This happened when use `oxc-parser` to parse `` `${foo satisfies bar}`; ``
        // https://github.com/oxc-project/oxc/issues/11313
        case "TemplateLiteral":
          /* c8 ignore next 3 */
          if (node.expressions.length !== node.quasis.length - 1) {
            throw new Error("Malformed template literal.");
          }
          break;

        case "TemplateElement":
          // `flow`, `hermes`, `typescript`, and `oxc`(with `{astType: 'ts'}`) follows the `espree` style positions
          // https://github.com/eslint/js/blob/5826877f7b33548e5ba984878dd4a8eac8448f87/packages/espree/lib/espree.js#L213
          if (
            astType === "flow" ||
            astType === "hermes" ||
            astType === "espree" ||
            astType === "typescript" ||
            isOxcTs
          ) {
            const start = locStart(node) + 1;
            const end = locEnd(node) - (node.tail ? 1 : 2);

            node.range = [start, end];
          }
          break;

        // remove redundant TypeScript nodes
        case "TSParenthesizedType":
          return node.typeAnnotation;

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

        // babel-flow
        case "TupleTypeAnnotation":
          if (node.types && !node.elementTypes) {
            node.elementTypes = node.types;
          }
          break;

        case "ImportDeclaration":
          if (astType === "hermes" && node.assertions && !node.attributes) {
            node.attributes = node.assertions;
            delete node.assertions;
          }
        // fall through
        case "Directive":
        case "ExpressionStatement":
        case "ExportDefaultDeclaration":
        case "ExportNamedDeclaration":
        case "ExportAllDeclaration":
          addNodeContentEnd(node, { comments, text });
          break;
      }
    },
    onLeave(node) {
      switch (node.type) {
        // Children can be parenthesized, need do this in `onLeave`
        case "LogicalExpression":
          // We remove unneeded parens around same-operator LogicalExpressions
          if (isUnbalancedLogicalTree(node)) {
            return rebalanceLogicalTree(node);
          }
          break;
      }

      /* c8 ignore next 3 */
      if (process.env.NODE_ENV !== "production") {
        assertRaw(node, text);
      }
    },
  });

  /* c8 ignore next 3 */
  if (process.env.NODE_ENV !== "production") {
    assertComments(comments, text);
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
function assertComments(comments, text) {
  for (const comment of comments) {
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
}

/* c8 ignore next */
function assertRaw(node, text) {
  if (!isNodeWithRaw(node)) {
    return;
  }

  const raw = node.type === "TemplateElement" ? node.value.raw : getRaw(node);
  assert.equal(raw, text.slice(locStart(node), locEnd(node)));
}

/**
@param {Node} node
@param {{comments: Comment[], text: string}} param1
*/
function addNodeContentEnd(node, { comments, text: originalText }) {
  let end = locEndWithFullText(node);
  if (originalText[end - 1] !== ";") {
    return;
  }

  const text = getTextWithoutComments({
    [commentsPropertyInOptions]: comments,
    originalText,
  });

  end -= 1;
  const textBeforeSemicolon = text.slice(locStart(node), end);
  const cleaned = textBeforeSemicolon.trimEnd();
  node.__contentEnd = end - (textBeforeSemicolon.length - cleaned.length);
}

export default postprocess;
