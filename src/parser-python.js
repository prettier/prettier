"use strict";

const { spawnSync } = require("child_process");

function parse(text /*, parsers, opts*/) {
  // TODO: return an useful error when https://github.com/fpoli/python-astexport
  // is not installed or when it fails

  const executionResult = spawnSync("astexport", [], { input: text });

  const error = executionResult.stderr.toString();

  if (error) {
    throw new Error(error);
  }

  const ast = JSON.parse(executionResult.stdout.toString());

  // TODO: add comments

  ast.comments = [];
  return ast;
}

module.exports = parse;
