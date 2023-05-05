import { parse } from "@babel/parser";
import { traverseFast as traverse } from "@babel/types";
import babelGenerator from "@babel/generator";

const generate = babelGenerator.default;

/* Doesn't work for dependencies, optional call, computed property, and spread arguments */

function transformEastAsianWidthModule(original) {
  let eastAsianWidthFunction;
  traverse(parse(original), (node) => {
    // We only need `eaw.eastAsianWidth`
    if (
      node.type === "AssignmentExpression" &&
      node.left.type === "MemberExpression" &&
      !node.left.computed &&
      !node.left.optional &&
      node.left.object.type === "Identifier" &&
      node.left.object.name === "eaw" &&
      node.left.property.type === "Identifier" &&
      node.left.property.name === "eastAsianWidth"
    ) {
      eastAsianWidthFunction = node.right;
    }
  });

  const functionBody = eastAsianWidthFunction.body.body;

  // We don't need `if (...) {return 'A';}`
  const index = functionBody.findIndex(
    (node) =>
      node.type === "IfStatement" &&
      node.consequent.type === "BlockStatement" &&
      node.consequent.body.length === 1 &&
      node.consequent.body[0].type === "ReturnStatement" &&
      node.consequent.body[0].argument.type === "StringLiteral" &&
      node.consequent.body[0].argument.value === "A"
  );

  if (index === -1) {
    throw new Error("Unexpected code");
  }

  functionBody.splice(index, 1);

  // `export default {eastAsianWidth: function() {}}`
  const { code } = generate({
    type: "ExportDefaultDeclaration",
    declaration: {
      type: "ObjectExpression",
      properties: [
        {
          type: "ObjectProperty",
          key: { type: "Identifier", name: "eastAsianWidth" },
          value: eastAsianWidthFunction,
        },
      ],
    },
  });

  return code;
}

export default transformEastAsianWidthModule;
