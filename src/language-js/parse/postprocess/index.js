import * as assert from "#universal/assert";
import { locEnd, locStart } from "../../loc.js";
import createTypeCheckFunction from "../../utils/create-type-check-function.js";
import getRaw from "../../utils/get-raw.js";
import isBlockComment from "../../utils/is-block-comment.js";
import isLineComment from "../../utils/is-line-comment.js";
import isTypeCastComment from "../../utils/is-type-cast-comment.js";
import mergeNestledJsdocComments from "./merge-nestled-jsdoc-comments.js";
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
 *   oxcAstType?: string,
 * }} options
 */
function postprocess(ast, options) {
  const { parser, text } = options;
  const { comments } = ast;
  const isOxcTs = parser === "oxc" && options.oxcAstType === "ts";

  mergeNestledJsdocComments(comments);

  let typeCastCommentsEnds;

  ast = visitNode(ast, {
    onLeave(node) {
      switch (node.type) {
        case "ParenthesizedExpression": {
          const { expression } = node;
          const start = locStart(node);

          // Align range with `flow`
          if (expression.type === "TypeCastExpression") {
            expression.range = [start, locEnd(node)];
            return expression;
          }

          let keepTypeCast = false;
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
            keepTypeCast =
              previousCommentEnd &&
              // check that there are only white spaces between the comment and the parenthesis
              text.slice(previousCommentEnd, start).trim().length === 0;
          }

          if (!keepTypeCast) {
            expression.extra = { ...expression.extra, parenthesized: true };
            return expression;
          }
          break;
        }

        case "LogicalExpression":
          // We remove unneeded parens around same-operator LogicalExpressions
          if (isUnbalancedLogicalTree(node)) {
            return rebalanceLogicalTree(node);
          }
          break;

        // This happens when use `oxc-parser` to parse `` `${foo satisfies bar}`; ``
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
            parser === "flow" ||
            parser === "hermes" ||
            parser === "espree" ||
            parser === "typescript" ||
            isOxcTs
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

        // https://github.com/facebook/hermes/issues/1712
        case "ImportExpression":
          if (parser === "hermes" && node.attributes && !node.options) {
            node.options = node.attributes;
          }
          break;
      }

      /* c8 ignore next 3 */
      if (process.env.NODE_ENV !== "production") {
        assertRaw(node, text);
      }
    },
  });

  // `InterpreterDirective` from babel parser and flow parser
  // Other parsers parse it as comment, babel treat it as comment too
  // https://github.com/babel/babel/issues/15116
  const program = ast.type === "File" ? ast.program : ast;
  if (program.interpreter) {
    comments.unshift(program.interpreter);
    delete program.interpreter;
  }

  if (isOxcTs && ast.hashbang) {
    comments.unshift(ast.hashbang);
    delete ast.hashbang;
  }

  /* c8 ignore next 3 */
  if (process.env.NODE_ENV !== "production") {
    assertComments(comments, text);
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

export default postprocess;
