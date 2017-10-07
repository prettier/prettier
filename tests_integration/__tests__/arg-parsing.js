"use strict";

const runPrettier = require("../runPrettier");

describe("boolean flags do not swallow the next argument", () => {
  runPrettier("cli/arg-parsing", ["--single-quote", "file.js"]).test({
    status: 0
  });
});

describe("negated options work", () => {
  runPrettier("cli/arg-parsing", ["--no-semi", "file.js"]).test({
    status: 0
  });
});

describe("unknown options are warned", () => {
  runPrettier("cli/arg-parsing", ["file.js", "--unknown"]).test({
    status: 0
  });
});

describe("unknown negated options are warned", () => {
  runPrettier("cli/arg-parsing", ["file.js", "--no-unknown"]).test({
    status: 0
  });
});

describe("deprecated options are warned", () => {
  runPrettier("cli/arg-parsing", ["file.js", "--flow-parser"]).test({
    status: 0
  });
});

describe("deprecated option values are warned", () => {
  runPrettier("cli/arg-parsing", ["file.js", "--trailing-comma"]).test({
    status: 0
  });
});
