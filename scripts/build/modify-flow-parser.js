import path from "node:path";

import babelGenerator from "@babel/generator";
import { parse } from "@babel/parser";
import MagicString from "magic-string";
import { outdent } from "outdent";

import { PROJECT_ROOT, writeFile } from "../utils/index.js";
const generate = babelGenerator.default;

function formatCode(input) {
  const ast = parse(input);

  const { body } = ast.program;
  // First `CallExpression` is shim for `globalThis`
  // Second `CallExpression` is an IIFE
  if (
    !(
      body.length === 2 &&
      body.every(
        (node) =>
          node.type === "ExpressionStatement" &&
          node.expression.type === "CallExpression",
      )
    )
  ) {
    throw new Error("Unexpected code.");
  }

  const mainFunction = body[1].expression.callee;
  if (!(mainFunction.params.length === 1)) {
    throw new Error("Unexpected code.");
  }

  const globalThisVariableName = mainFunction.params[0].name;
  const expressions = mainFunction.body.body;
  const lastExpression = expressions.at(-1);

  if (
    !(
      lastExpression.type === "ForStatement" &&
      lastExpression.body.type === "BlockStatement" &&
      lastExpression.body.body.at(-1).type === "ReturnStatement"
    )
  ) {
    throw new Error("Unexpected code.");
  }

  lastExpression.body.body.pop();

  ast.program.body = mainFunction.body.body;

  let { code } = generate(ast);

  const match = code.match(
    /\n {2}if \(typeof exports !== "undefined"\) var (?<exportsName>.*?) = exports;else {.*?\n {2}}/s,
  );

  if (!match) {
    throw new Error("Unexpected code.");
  }

  const { exportsName } = match.groups;

  code = code.replace(match[0], "");

  code = outdent`
    var ${globalThisVariableName} = globalThis;
    var ${exportsName} = {};
    ${code}

    export default ${exportsName};
  `;

  return code;
}

function* getClassesWithRequireCall(ast, text) {
  for (const node of ast.program.body) {
    if (node.type === "FunctionDeclaration") {
      const nodeText = text.slice(node.start, node.end);

      if (!nodeText.includes("require(")) {
        continue;
      }

      const className = node.id.name;

      yield {
        classNode: node,
        className,
        prototypeNodes: ast.program.body.filter((node) =>
          text.slice(node.start, node.end).startsWith(`${className}.prototype`),
        ),
      };
    }
  }
}

function modifyFlowParser(text) {
  text = formatCode(text);

  const source = new MagicString(text);
  const ast = parse(text, { sourceType: "module" });
  for (const {
    className,
    classNode,
    prototypeNodes,
  } of getClassesWithRequireCall(ast, text)) {
    source.overwrite(
      classNode.start,
      classNode.end,
      `function ${className} () {}`,
    );

    for (const prototypeNode of prototypeNodes) {
      source.remove(prototypeNode.start, prototypeNode.end);
    }
  }

  return source.toString();
}

// Save modified code to `{PROJECT_ROOT}/.tmp/modified-flow-parser.js` for debug
const saveOutputToDisk = (process) => (text) => {
  const result = process(text);
  writeFile(path.join(PROJECT_ROOT, ".tmp/modified-flow-parser.js"), result);
  return result;
};

export default saveOutputToDisk(modifyFlowParser);
