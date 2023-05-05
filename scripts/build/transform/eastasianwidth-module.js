import { parse } from "@babel/parser";
import { traverseFast as traverse } from "@babel/types";
import babelGenerator from "@babel/generator";

const generate = babelGenerator.default;

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

  // We only need `IfStatement`s returns `"F"` or `"W"`
  for (let index = functionBody.length - 1; index >= 0; index--) {
    const node = functionBody[index];

    if (
      node.type === "IfStatement" &&
      node.consequent.type === "BlockStatement" &&
      node.consequent.body.length === 1 &&
      node.consequent.body[0].type === "ReturnStatement" &&
      node.consequent.body[0].argument.type === "StringLiteral"
    ) {
      const { value } = node.consequent.body[0].argument;
      if (value !== "F" && value !== "W") {
        functionBody.splice(index, 1);
      }
    }
  }

  const ast = parse("export default { eastAsianWidth() {} };", {
    sourceType: "module",
  });
  Object.assign(ast.program.body[0].declaration.properties[0], {
    params: eastAsianWidthFunction.params,
    body: eastAsianWidthFunction.body,
  });

  const { code } = generate(ast);
  return code;
}

export default transformEastAsianWidthModule;
