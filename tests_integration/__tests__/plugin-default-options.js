"use strict";

const runPrettier = require("../runPrettier");

describe("plugin default options should work", () => {
  runPrettier(
    "plugins/defaultOptions",
    ["--stdin-filepath", "example.foo", "--plugin=./plugin"],
    { input: "hello-world" }
  ).test({
    stdout: "tabWidth:8",
    stderr: "",
    status: 0,
    write: []
  });
});

describe("overriding plugin default options should work", () => {
  runPrettier(
    "plugins/defaultOptions",
    ["--stdin-filepath", "example.foo", "--plugin=./plugin", "--tab-width=4"],
    { input: "hello-world" }
  ).test({
    stdout: "tabWidth:4",
    stderr: "",
    status: 0,
    write: []
  });
});
