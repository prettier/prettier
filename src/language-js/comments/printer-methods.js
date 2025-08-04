import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import {
  getFunctionParameters,
  hasNodeIgnoreComment,
  isJsxElement,
  isUnionType,
} from "../utils/index.js";

/**
 * @import {Node} from "../types/estree.js"
 * @import AstPath from "../../common/ast-path.js"
 */

const nodeTypesCanNotAttachComment = new Set([
  "EmptyStatement",
  "TemplateElement",
  // There is no similar node in Babel AST
  // ```ts
  // class Foo {
  //   bar();
  //      ^^^ TSEmptyBodyFunctionExpression
  // }
  // ```
  "TSEmptyBodyFunctionExpression",
  // There is no similar node in Babel AST, `a?.b`
  "ChainExpression",
]);
function canAttachComment(node) {
  return !nodeTypesCanNotAttachComment.has(node.type);
}

/**
 * @param {any} node
 * @returns {Node[] | void}
 */
function getCommentChildNodes(node, options) {
  // Prevent attaching comments to FunctionExpression in this case:
  //     class Foo {
  //       bar() // comment
  //       {
  //         baz();
  //       }
  //     }
  if (
    (options.parser === "typescript" ||
      options.parser === "flow" ||
      options.parser === "hermes" ||
      options.parser === "acorn" ||
      options.parser === "oxc" ||
      options.parser === "oxc-ts" ||
      options.parser === "espree" ||
      options.parser === "meriyah" ||
      options.parser === "__babel_estree") &&
    node.type === "MethodDefinition" &&
    node.value?.type === "FunctionExpression" &&
    getFunctionParameters(node.value).length === 0 &&
    !node.value.returnType &&
    !isNonEmptyArray(node.value.typeParameters) &&
    node.value.body
  ) {
    return [...(node.decorators || []), node.key, node.value.body];
  }
}

/**
 * @param {AstPath} path
 * @returns {boolean}
 */
function willPrintOwnComments(path) {
  const { node, parent } = path;
  return (
    (isJsxElement(node) ||
      (parent &&
        (parent.type === "JSXSpreadAttribute" ||
          parent.type === "JSXSpreadChild" ||
          isUnionType(parent) ||
          parent.type === "MatchOrPattern" ||
          ((parent.type === "ClassDeclaration" ||
            parent.type === "ClassExpression") &&
            parent.superClass === node)))) &&
    (!hasNodeIgnoreComment(node) || isUnionType(parent))
  );
}

function isGap(text, { parser }) {
  if (parser === "flow" || parser === "hermes" || parser === "babel-flow") {
    // Example: (a /* b */ /* : c */)
    //                gap ^^^^
    text = text.replaceAll(/[\s(]/gu, "");
    return text === "" || text === "/*" || text === "/*::";
  }
}

export { printComment } from "../print/comment.js";
export { default as isBlockComment } from "../utils/is-block-comment.js";
export * as handleComments from "./handle-comments.js";
export { canAttachComment, getCommentChildNodes, isGap, willPrintOwnComments };
