import path from "node:path";

import babelGenerator from "@babel/generator";
import { parse } from "@babel/parser";
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

function removeRequire(text) {
  const { fsModuleNameVariableName } = text.match(
    /,(?<fsModuleNameVariableName>[\p{ID_Start}_$][\p{ID_Continue}$]*)="fs",/u,
  ).groups;

  return text
    .replaceAll(`require(${fsModuleNameVariableName})`, "{}")
    .replaceAll('require("fs")', "{}")
    .replaceAll('require("constants")', "{}");
}

function modifyFlowParser(text) {
  text = removeRequire(text);
  text = formatCode(text);

  return text;
}

// Save modified code to `{PROJECT_ROOT}/.tmp/modified-flow-parser.js` for debug
const saveOutputToDisk = (process) => (text) => {
  const result = process(text);
  writeFile(path.join(PROJECT_ROOT, ".tmp/modified-flow-parser.js"), result);
  return result;
};

export default saveOutputToDisk(modifyFlowParser);
