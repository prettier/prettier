import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";
import { traverseFast as traverse } from "@babel/types";
import babelGenerator from "@babel/generator";
import { outdent } from "outdent";

const generate = babelGenerator.default;
const atHelperPath = fileURLToPath(
  new URL("../shims/at-helper.js", import.meta.url)
);

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

  return true;
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

  const { object, property } = callee;
  if (!(property.type === "Identifier" && property.name === "at")) {
    return;
  }

  node.arguments.unshift(object);
  node.callee = { type: "Identifier", name: "__at" };

  return true;
}

function transform(original, file) {
  if (
    file === atHelperPath ||
    (!original.includes(".at(") && !original.includes("Object.hasOwn("))
  ) {
    return original;
  }

  let changed = false;
  let shouldInjectRelativeIndexingHelper = false;
  const ast = parse(original, { sourceType: "module" });
  traverse(ast, (node) => {
    changed ||= transformObjectHasOwnCall(node);
    shouldInjectRelativeIndexingHelper ||= transformRelativeIndexingCall(node);
    changed ||= shouldInjectRelativeIndexingHelper;
  });

  if (!changed) {
    return original;
  }

  let { code } = generate(ast);

  if (shouldInjectRelativeIndexingHelper) {
    code = outdent`
      import __at from ${JSON.stringify(atHelperPath)};

      ${code}
    `;
  }

  return code;
}

export default transform;
