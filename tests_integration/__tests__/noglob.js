"use strict";

const runPrettier = require("../runPrettier");

describe("process exact passed filename with --noglob", () => {
  runPrettier("cli/noglob", ["--noglob", "[code].js"]).test({
    status: 0
  });
});

describe("cannot access exact filename without --noglob", () => {
  runPrettier("cli/noglob", ["[code].js"]).test({
    status: 2
  });
});

describe("can access files with glob without --noglob", () => {
  runPrettier("cli/noglob", ["[AB].js"]).test({
    status: 0
  });
});

describe("cannot access files with glob with --noglob", () => {
  runPrettier("cli/noglob", ["--noglob", "[AB].js"]).test({
    status: 2
  });
});
