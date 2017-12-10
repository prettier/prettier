"use strict";

const spawnSync = require("child_process").spawnSync;
const path = require("path");

function parseText(text, pythonExecutable) {
  const executionResult = spawnSync(
    pythonExecutable,
    [path.join(__dirname, "../vendor/python/astexport.py")],
    {
      input: text
    }
  );

  const error = executionResult.stderr.toString();

  if (error) {
    throw new Error(error);
  }

  return executionResult;
}

function parse(text /*, parsers, opts*/) {
  let executionResult;

  // TODO: I am assuming that python3 and python2 will
  // always be in the PATH, will this always be the case?

  try {
    executionResult = parseText(text, "python3");
  } catch (e) {
    executionResult = parseText(text, "python2");
  }

  const ast = JSON.parse(executionResult.stdout.toString());

  // TODO: add comments

  ast.comments = [];
  return ast;
}

module.exports = parse;
