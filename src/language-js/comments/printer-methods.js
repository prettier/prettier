import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import {
  createTypeCheckFunction,
  getFunctionParameters,
  hasNodeIgnoreComment,
  isJsxElement,
  isMeaningfulEmptyStatement,
  isMethod,
  isUnionType,
} from "../utils/index.js";

/**
 * @import {Node} from "../types/estree.js"
 * @import AstPath from "../../common/ast-path.js"
 */

const isNodeCantAttachComment = createTypeCheckFunction([
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

/**
@param {Node} node
@param {any[]} param1
@returns {boolean}
*/
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

@param {Node} node
@param {any[]} param1
@returns {boolean}
*/
const isClassMethodCantAttachComment = (node, [parent]) =>
  Boolean(
    node.type === "FunctionExpression" &&
      parent.type === "MethodDefinition" &&
      parent.value === node &&
      getFunctionParameters(node).length === 0 &&
      !node.returnType &&
      !isNonEmptyArray(node.typeParameters) &&
      node.body,
  );

// `foo as const`
//  ^^^^^^^^^^^^ `TSAsExpression`
//         ^^^^^ `TSTypeReference` (`TSAsExpression.typeAnnotation`)
//         ^^^^^ `Identifier` (`TSTypeReference.typeName`)
/**
@param {Node} node
@param {Node[]} param1
@returns {boolean}
*/
const isAsConstTypeReference = (node, [parent]) =>
  node.type === "TSTypeReference" &&
  node.typeName.type === "Identifier" &&
  node.typeName.name === "const" &&
  parent.type === "TSAsExpression" &&
  parent.typeAnnotation === node;
/**
@param {Node} node
@param {Node[]} param1
@returns {boolean}
*/
const isAsConst = (node, [parent, ...ancestors]) =>
  isAsConstTypeReference(node, [parent]) ||
  // @ts-expect-error -- Safe
  (parent?.typeName === node && isAsConstTypeReference(parent, ancestors));

/**
@param {Node} node
@param {any[]} ancestors
@returns {boolean}
*/
function canAttachComment(node, ancestors) {
  if (
    isNodeCantAttachComment(node) ||
    isChildWontPrint(node, ancestors) ||
    // @ts-expect-error -- safe
    isClassMethodCantAttachComment(node, ancestors)
  ) {
    return false;
  }

  if (node.type === "EmptyStatement") {
    return isMeaningfulEmptyStatement({ node, parent: ancestors[0] });
  }

  // Flow doesn't generate node for `as const`
  if (isAsConst(node, ancestors)) {
    return false;
  }

  /*
  For this code
  `interface A {property: B}`
                          ^ `ObjectTypeProperty.value` (Flow)
  `interface A {property: B}`
                        ^^^ `TSPropertySignature.typeAnnotation` (TypeScript)
                          ^ `TSPropertySignature.typeAnnotation.typeAnnotation` (TypeScript)
  ```

  To avoid inconsistent, let's attach to the Identifier instead.
  */
  if (
    node.type === "TSTypeAnnotation" &&
    ancestors[0].type === "TSPropertySignature"
  ) {
    return false;
  }

  return true;
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
export { default as handleComments } from "./handle-comments.js";
export { canAttachComment, isGap, willPrintOwnComments };
