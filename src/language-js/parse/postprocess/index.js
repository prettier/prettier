import assert from "node:assert";
import { locEnd, locStart } from "../../loc.js";
import createTypeCheckFunction from "../../utils/create-type-check-function.js";
import getRaw from "../../utils/get-raw.js";
import getTextWithoutComments from "../../utils/get-text-without-comments.js";
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
 *   oxcAstType?: string,
 * }} options
 */
function postprocess(ast, options) {
  const { parser, text } = options;

  // `InterpreterDirective` from babel parser and flow parser
  // Other parsers parse it as comment, babel treat it as comment too
  // https://github.com/babel/babel/issues/15116
  const program = ast.type === "File" ? ast.program : ast;
  const { interpreter } = program;
  if (interpreter) {
    ast.comments.unshift(interpreter);
    delete program.interpreter;
  }

  if (parser === "oxc" && options.oxcAstType === "ts" && ast.hashbang) {
    const { comments, hashbang } = ast;
    comments.unshift(hashbang);
    delete program.hashbang;
  }

  if (ast.comments.length > 0) {
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

      /* c8 ignore next 3 */
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

  ast = visitNode(ast, (node) => {
    switch (node.type) {
      case "ParenthesizedExpression": {
        const { expression } = node;
        const start = locStart(node);

        // Align range with `flow`
        if (expression.type === "TypeCastExpression") {
          expression.range = [start, locEnd(node)];
          return expression;
        }

        // Keep ParenthesizedExpression nodes only if they have Closure-style type cast comments.
        const previousComment = ast.comments.findLast(
          (comment) => locEnd(comment) <= start,
        );
        const keepTypeCast =
          previousComment &&
          isTypeCastComment(previousComment) &&
          // check that there are only white spaces between the comment and the parenthesis
          text.slice(locEnd(previousComment), start).trim().length === 0;

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
          (parser === "oxc" && options.oxcAstType === "ts")
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
        fixBabelTSTypeParameter(node);
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

      // Remove this when update `@babel/parser` to v8
      // https://github.com/typescript-eslint/typescript-eslint/pull/7065
      case "TSMappedType":
        if (!node.constraint && !node.key) {
          const { name: key, constraint } = fixBabelTSTypeParameter(
            node.typeParameter,
          );
          node.constraint = constraint;
          node.key = key;
          delete node.typeParameter;
        }
        break;

      // Remove this when update `@babel/parser` to v8
      // https://github.com/typescript-eslint/typescript-eslint/pull/8920
      case "TSEnumDeclaration":
        if (!node.body) {
          const idEnd = locEnd(node.id);
          const { members } = node;
          const textWithoutComments = getTextWithoutComments(
            {
              originalText: text,
              [Symbol.for("comments")]: ast.comments,
            },
            idEnd,
            members[0] ? locStart(members[0]) : locEnd(node),
          );
          const start = idEnd + textWithoutComments.indexOf("{");
          node.body = {
            type: "TSEnumBody",
            members,
            range: [start, locEnd(node)],
          };
          delete node.members;
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
  });

  // In `typescript`/`espree`/`flow`, `Program` doesn't count whitespace and comments
  // See https://github.com/eslint/espree/issues/488
  if (ast.type === "Program") {
    ast.range = [0, text.length];
  }
  return ast;
}

function fixBabelTSTypeParameter(node) {
  if (node.type === "TSTypeParameter" && typeof node.name === "string") {
    const start = locStart(node);
    node.name = {
      type: "Identifier",
      name: node.name,
      range: [start, start + node.name.length],
    };
  }

  return node;
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
