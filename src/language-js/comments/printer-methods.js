import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import { hasJsxIgnoreComment } from "../print/jsx.js";
import {
  getFunctionParameters,
  hasNodeIgnoreComment,
  isJsxElement,
  isLineComment,
} from "../utils/index.js";
import isBlockComment from "../utils/is-block-comment.js";

/**
 * @typedef {import("../types/estree.js").Node} Node
 * @typedef {import("../../common/ast-path.js").default} AstPath
 */

function canAttachComment(node) {
  return (
    node.type &&
    !isBlockComment(node) &&
    !isLineComment(node) &&
    node.type !== "EmptyStatement" &&
    node.type !== "TemplateElement" &&
    node.type !== "Import" &&
    // `babel-ts` doesn't have similar node for `class Foo { bar() /* bat */; }`
    node.type !== "TSEmptyBodyFunctionExpression" &&
    // `babel` doesn't have similar node to attach comments
    node.type !== "ChainExpression"
  );
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
      options.parser === "acorn" ||
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

function hasPrettierIgnore(path) {
  return hasNodeIgnoreComment(path.node) || hasJsxIgnoreComment(path);
}

/**
 * @param {AstPath} path
 * @returns {boolean}
 */
function willPrintOwnComments({ node, parent }) {
  return (
    (isJsxElement(node) ||
      (parent &&
        (parent.type === "JSXSpreadAttribute" ||
          parent.type === "JSXSpreadChild" ||
          parent.type === "UnionTypeAnnotation" ||
          parent.type === "TSUnionType" ||
          ((parent.type === "ClassDeclaration" ||
            parent.type === "ClassExpression") &&
            parent.superClass === node)))) &&
    (!hasNodeIgnoreComment(node) ||
      parent.type === "UnionTypeAnnotation" ||
      parent.type === "TSUnionType")
  );
}

function isGap(text, { parser }) {
  if (parser === "flow" || parser === "babel-flow") {
    // Example: (a /* b */ /* : c */)
    //                gap ^^^^
    text = text.replaceAll(/[\s(]/g, "");
    return text === "" || text === "/*" || text === "/*::";
  }
}

export * as handleComments from "./handle-comments.js";
export { printComment } from "../print/comment.js";
export {
  canAttachComment,
  getCommentChildNodes,
  hasPrettierIgnore,
  isBlockComment,
  willPrintOwnComments,
  isGap,
};
