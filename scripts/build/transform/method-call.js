import { fileURLToPath } from "node:url";

/**
 * @param {import("@babel/types").Node} node
 * @returns {boolean}
 */
function isMethodCall(node, { method, argumentsLength }) {
  return (
    (node.type === "CallExpression" ||
      node.type === "OptionalCallExpression") &&
    !node.optional &&
    node.arguments.length === argumentsLength &&
    node.arguments.every(({ type }) => type !== "SpreadElement") &&
    (node.callee.type === "MemberExpression" ||
      node.callee.type === "OptionalMemberExpression") &&
    !node.callee.computed &&
    node.callee.object.type !== "ThisExpression" &&
    node.callee.property.type === "Identifier" &&
    node.callee.property.name === method
  );
}

/**
 * `foo.at(index)` -> `__at(false, foo, index)`
 * `foo?.at(index)` -> `__at(true, foo, index)`
 *
 * @param {import("@babel/types").CallExpression | import("@babel/types").OptionalCallExpression} node
 * @returns {import("@babel/types").CallExpression}
 */
function transformMethodCallToFunctionCall(node, functionName) {
  // `__at(isOptionalObject, object, ...arguments)`
  node.arguments.unshift(
    {
      type: "BooleanLiteral",
      value: node.callee.type === "OptionalMemberExpression",
      leadingComments: [{ type: "CommentBlock", value: " isOptionalObject" }],
    },
    node.callee.object
  );

  node.callee = { type: "Identifier", name: functionName };
}

function createMethodCallTransform({
  method,
  argumentsLength,
  functionName = `__${method}`,
  functionImplementation,
}) {
  functionImplementation = fileURLToPath(functionImplementation);

  return {
    shouldSkip: (text, file) =>
      !text.includes(`.${method}(`) || file === functionImplementation,
    test: (node) => isMethodCall(node, { method, argumentsLength }),
    transform: (node) => transformMethodCallToFunctionCall(node, functionName),
    inject: `import ${functionName} from ${JSON.stringify(
      functionImplementation
    )};`,
  };
}

export default createMethodCallTransform;
