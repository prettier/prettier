import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import {
  createTypeCheckFunction,
  getFunctionParameters,
  isMeaningfulEmptyStatement,
  isMethod,
  isTsAsConstExpression,
} from "../utilities/index.js";

/**
@import {Node} from "../types/estree.js";
@import AstPath from "../../common/ast-path.js";
*/

const isNodeCantAttachComment = createTypeCheckFunction([
  // Babel only
  "File",
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
@param {Node[]} param1
@returns {boolean}
*/
const isChildWontPrint = (node, [parent]) =>
  (parent?.type === "ComponentParameter" &&
    parent.shorthand &&
    parent.name === node &&
    parent.local !== parent.name) ||
  (parent?.type === "MatchObjectPatternProperty" &&
    parent.shorthand &&
    parent.key === node) ||
  (parent?.type === "ObjectProperty" &&
    parent.shorthand &&
    parent.key === node &&
    parent.value !== parent.key) ||
  (parent?.type === "Property" &&
    parent.shorthand &&
    parent.key === node &&
    !isMethod(parent) &&
    parent.value !== parent.key);

/**
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
@param {Node[]} param1
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
const isTsAsConstTypeReference = (node, [parent]) =>
  // @ts-expect-error -- Safe
  parent?.typeAnnotation === node && isTsAsConstExpression(parent);
/**
@param {Node} node
@param {Node[]} param1
@returns {boolean}
*/
const isTsAsConst = (node, [parent, ...ancestors]) =>
  isTsAsConstTypeReference(node, [parent]) ||
  // @ts-expect-error -- Safe
  (parent?.typeName === node && isTsAsConstTypeReference(parent, ancestors));

/**
@param {Node} node
@param {any[]} ancestors
@returns {boolean}
*/
function canAttachComment(node, ancestors) {
  if (
    isNodeCantAttachComment(node) ||
    isChildWontPrint(node, ancestors) ||
    isClassMethodCantAttachComment(node, ancestors)
  ) {
    return false;
  }

  if (node.type === "EmptyStatement") {
    return isMeaningfulEmptyStatement({ node, parent: ancestors[0] });
  }

  // Flow doesn't generate node for `as const`
  if (isTsAsConst(node, ancestors)) {
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

export default canAttachComment;
