/*
`Object.hasOwn(foo, "bar")` -> `Object.prototype.hasOwnProperty.call(foo, "bar")`
*/

const transformObjectHasOwnCall = {
  shouldSkip: (text) => !text.includes("Object.hasOwn("),
  /**
   * @param {import("@babel/types").Node} node
   * @returns {boolean}
   */
  test(node) {
    return (
      node.type === "CallExpression" &&
      !node.optional &&
      node.arguments.length === 2 &&
      node.arguments.every(({ type }) => type !== "SpreadElement") &&
      node.callee.type === "MemberExpression" &&
      !node.callee.optional &&
      !node.callee.computed &&
      node.callee.object.type === "Identifier" &&
      node.callee.object.name === "Object" &&
      node.callee.property.type === "Identifier" &&
      node.callee.property.name === "hasOwn"
    );
  },
  /**
   * @param {import("@babel/types").CallExpression} node
   * @returns {import("@babel/types").CallExpression}
   */
  transform(node) {
    node.callee = {
      type: "MemberExpression",
      object: {
        type: "MemberExpression",
        object: {
          type: "MemberExpression",
          object: { type: "Identifier", name: "Object" },
          property: { type: "Identifier", name: "prototype" },
        },
        property: { type: "Identifier", name: "hasOwnProperty" },
      },
      property: { type: "Identifier", name: "call" },
    };
  },
};

export default transformObjectHasOwnCall;
