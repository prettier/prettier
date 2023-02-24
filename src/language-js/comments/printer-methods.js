import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import {
  getFunctionParameters,
  hasNodeIgnoreComment,
  isJsxElement,
} from "../utils/index.js";

/**
 * @typedef {import("../types/estree.js").Node} Node
 * @typedef {import("../../common/ast-path.js").default} AstPath
 */

const nodeTypesCanNotAttachComment = new Set([
  "EmptyStatement",
  "TemplateElement",
  // In ESTree `import` is a token, `import("foo")`
  "Import",
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
export { default as isBlockComment } from "../utils/is-block-comment.js";
export { canAttachComment, getCommentChildNodes, willPrintOwnComments, isGap };
