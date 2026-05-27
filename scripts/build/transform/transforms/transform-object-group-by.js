import { fileURLToPath } from "node:url";
import { outdent } from "outdent";
import { createIdentifier, isIdentifier } from "./utilities.js";

/*
`Object.groupBy(items, callbackFn)` -> `__objectGroupBy(items, callbackFn)`
*/

const functionName = "__objectGroupBy";
const functionImplementationPath = fileURLToPath(
  new URL("../../shims/object-group-by.js", import.meta.url),
);

const transformObjectHasOwnCall = {
  shouldSkip: (text) => !text.includes("Object.groupBy("),
  /**
   * @param {import("@babel/types").Node} node
   * @returns {boolean}
   */
  test: (node) =>
    node.type === "CallExpression" &&
    !node.optional &&
    node.arguments.length === 2 &&
    node.arguments.every(({ type }) => type !== "SpreadElement") &&
    node.callee.type === "MemberExpression" &&
    !node.callee.optional &&
    !node.callee.computed &&
    isIdentifier(node.callee.object, "Object") &&
    isIdentifier(node.callee.property, "groupBy"),
  /**
   * @param {import("@babel/types").CallExpression} node
   * @returns {import("@babel/types").CallExpression}
   */
  transform: (node) => ({
    ...node,
    callee: createIdentifier(functionName),
  }),
  inject: outdent`
    import ${functionName} from ${JSON.stringify(functionImplementationPath)};
  `,
};

export default transformObjectHasOwnCall;
