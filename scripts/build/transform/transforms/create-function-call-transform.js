import { fileURLToPath } from "node:url";
import { outdent } from "outdent";
import { createIdentifier, isIdentifier } from "./utilities.js";

/* Only works for function `Object.hasOwn()` and `Object.groupBy()` */

/**
 * @param {import("@babel/types").Node} node
 * @returns {boolean}
 */
function isFunctionCall(node, { name, argumentsLength }) {
  const [objectName, methodName] = name.split(".");

  return (
    node.type === "CallExpression" &&
    !node.optional &&
    node.arguments.length === argumentsLength &&
    node.arguments.every(({ type }) => type !== "SpreadElement") &&
    node.callee.type === "MemberExpression" &&
    !node.callee.optional &&
    !node.callee.computed &&
    isIdentifier(node.callee.object, objectName) &&
    isIdentifier(node.callee.property, methodName)
  );
}

/**
 * `Object.hasOwn(foo, bar)` -> `__Object_hasOwn(foo, bar)`
 *
 * @param {import("@babel/types").CallExpression | import("@babel/types").OptionalCallExpression} node
 * @returns {import("@babel/types").CallExpression}
 */
function transformFunctionCall(node, functionName) {
  return {
    ...node,
    callee: createIdentifier(functionName),
  };
}

function createFunctionCallTransform({ function: name, argumentsLength }) {
  const functionName = `__${name.replaceAll(".", "_")}`;
  const fileName = `function-${name
    .replace(/^[A-Z]/, (character) => character.toLowerCase())
    .replaceAll(/\W/g, "-")
    .replaceAll(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)}.js`;
  const functionImplementationUrl = new URL(
    `../../shims/${fileName}`,
    import.meta.url,
  );
  const functionImplementationPath = fileURLToPath(functionImplementationUrl);

  return {
    shouldSkip: (text, file) =>
      !text.includes(`${name}(`) || file === functionImplementationPath,
    test: (node) => isFunctionCall(node, { name, argumentsLength }),
    transform: (node) => transformFunctionCall(node, functionName),
    inject: outdent`
      import ${functionName} from ${JSON.stringify(functionImplementationPath)};
    `,
  };
}

export default createFunctionCallTransform;
