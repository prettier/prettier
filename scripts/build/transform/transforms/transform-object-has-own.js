import { createMemberExpression, isIdentifier } from "./utilities.js";

/*
`Object.hasOwn(foo, "bar")` -> `Object.prototype.hasOwnProperty.call(foo, "bar")`
*/

const transformObjectHasOwnCall = {
  shouldSkip: (text) => !text.includes("Object.hasOwn("),
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
    isIdentifier(node.callee.property, "hasOwn"),
  /**
   * @param {import("@babel/types").CallExpression} node
   * @returns {import("@babel/types").CallExpression}
   */
  transform: (node) => ({
    ...node,
    callee: createMemberExpression("Object.prototype.hasOwnProperty.call"),
  }),
};

export default transformObjectHasOwnCall;
