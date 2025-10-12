import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import {
  createTypeCheckFunction,
  getFunctionParameters,
  hasNodeIgnoreComment,
  isJsxElement,
  isMethod,
  isUnionType,
} from "../utils/index.js";

/**
 * @import {Node} from "../types/estree.js"
 * @import AstPath from "../../common/ast-path.js"
 */

const isNodeCantAttachComment = createTypeCheckFunction([
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

const isChildWontPrint = (node, [parent]) =>
  (parent?.type === "ComponentParameter" &&
    parent.shorthand &&
    parent.name === node &&
    parent.local !== parent.name) ||
  (parent?.type === "MatchObjectPatternProperty" &&
    parent.shorthand &&
    parent.key === node &&
    parent.value !== parent.key) ||
  (parent?.type === "ObjectProperty" &&
    parent.shorthand &&
    parent.key === node &&
    parent.value !== parent.key) ||
  (parent?.type === "Property" &&
    parent.shorthand &&
    parent.key === node &&
    !isMethod(parent) &&
    parent.value !== parent.key);

/*
Prevent attaching comments to FunctionExpression in this case:
```
class Foo {
  bar() // comment
  {
    baz();
  }
}
```
*/
const isClassMethodCantAttachComment = (node, [parent]) =>
  Boolean(
    node.type === "FunctionExpression" &&
      parent?.type === "MethodDefinition" &&
      parent.value === node &&
      getFunctionParameters(node).length === 0 &&
      !node.returnType &&
      !isNonEmptyArray(node.typeParameters) &&
      node.body,
  );

/**
@param {Node} node
@param {Node[]} ancestors
@returns {boolean}
*/
function canAttachComment(node, ancestors) {
  return !(
    isNodeCantAttachComment(node) ||
    isChildWontPrint(node, ancestors) ||
    isClassMethodCantAttachComment(node, ancestors)
  );
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
export { canAttachComment, isGap, willPrintOwnComments };
