import createTypeCheckFunction from "./create-type-check-function.js";

// https://github.com/vuejs/core/blob/35785f3cd7bd86cbec3f8324022491da2d088b61/packages/compiler-core/src/babelUtils.ts#L498
const isTsNode = createTypeCheckFunction([
  "TSAsExpression", // foo as number
  "TSTypeAssertion", // (<number>foo)
  "TSNonNullExpression", // foo!
  "TSInstantiationExpression", // foo<string>
  "TSSatisfiesExpression", // foo satisfies T
]);

// https://github.com/vuejs/core/blob/35785f3cd7bd86cbec3f8324022491da2d088b61/packages/compiler-core/src/babelUtils.ts#L506C8-L512C2
function unwrapTsNode(node) {
  if (isTsNode(node)) {
    return unwrapTsNode(node.expression);
  }

  return node;
}

// https://github.com/vuejs/core/blob/35785f3cd7bd86cbec3f8324022491da2d088b61/packages/compiler-core/src/utils.ts#L197
function isVueEventBindingFunctionExpression(node) {
  node = unwrapTsNode(node);
  return (
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  );
}

// https://github.com/vuejs/core/blob/35785f3cd7bd86cbec3f8324022491da2d088b61/packages/compiler-core/src/utils.ts#L161
function isVueEventBindingMemberExpression(node) {
  node = unwrapTsNode(node);
  return (
    node.type === "MemberExpression" ||
    node.type === "OptionalMemberExpression" ||
    (node.type === "Identifier" && node.name !== "undefined")
  );
}

export {
  isVueEventBindingFunctionExpression,
  isVueEventBindingMemberExpression,
};
