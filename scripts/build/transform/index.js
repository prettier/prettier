import { parse } from "@babel/parser";
import { traverseFast as traverse } from "@babel/types";
import babelGenerator from "@babel/generator";
import { outdent } from "outdent";

const generate = babelGenerator.default;

/* Doesn't work for optional chaining */

// `Object.hasOwn(foo, "bar")` -> `Object.prototype.hasOwnProperty.call(foo, "bar")`
function transformObjectHasOwnCall(node) {
  if (node.type !== "CallExpression") {
    return;
  }

  const { callee } = node;
  if (!(callee.type === "MemberExpression" && !callee.computed)) {
    return;
  }

  const { object, property } = callee;
  if (
    !(
      object.type === "Identifier" &&
      object.name === "Object" &&
      property.type === "Identifier" &&
      property.name === "hasOwn"
    )
  ) {
    return;
  }

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
}

// `foo.at(index)` -> `__at(foo, index)`
function transformRelativeIndexingCall(node) {
  if (node.type !== "CallExpression") {
    return;
  }

  const { callee } = node;
  if (!(callee.type === "MemberExpression" && !callee.computed)) {
    return;
  }

  const { property } = callee;
  if (!(property.type === "Identifier" && property.name === "at")) {
    return;
  }

  node.arguments.unshift(callee);
  node.callee = { type: "Identifier", name: "__at" };
  return true;
}

function transform(original) {
  if (!original.includes(".at(") && !original.includes("Object.hasOwn("))
    return;

  let shouldInjectRelativeIndexingHelper = true;
  const ast = parse(original);
  traverse(ast, (node) => {
    transformObjectHasOwnCall(node);
    shouldInjectRelativeIndexingHelper ||= transformRelativeIndexingCall(node);
  });

  let { code } = generate(ast);

  if (shouldInjectRelativeIndexingHelper) {
    code = outdent`
      const __at = (object, index) =>
        object.at
          ? object.at(index)
          : object[index < 0 ? object[object.length + index] : index];

      ${code}
    `;
  }

  return code;
}

export default transform;
