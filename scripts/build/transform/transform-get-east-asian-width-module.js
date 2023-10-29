import { parse } from "@babel/parser";
import { traverseFast as traverse } from "@babel/types";
import babelGenerator from "@babel/generator";

const generate = babelGenerator.default;

function transformGetEastAsianWidthModule(original) {
  let lookupFunction;
  const ast = parse(original, { sourceType: "module" });
  traverse(ast, (node) => {
    if (node.type === "FunctionDeclaration" && node.id.name === "lookup") {
      lookupFunction = node;
    }
  });

  const functionBody = lookupFunction.body.body;

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

  const { code } = generate(ast);
  return code;
}

export default transformGetEastAsianWidthModule;
