"use strict";

const runPrettier = require("../run-prettier.js");

describe("json-stringify takes precedence over json for package.json", () => {
  runPrettier("plugins", ["--stdin-filepath=package.json"], {
    input:
      '{ "a": "longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong" }',
  }).test({
    stdout:
      '{\n  "a": "longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong"\n}\n',
    stderr: "",
    status: 0,
    write: [],
  });
});
