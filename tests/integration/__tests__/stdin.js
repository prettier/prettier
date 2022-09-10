"use strict";

const { outdent } = require("outdent");
const runPrettier = require("../run-prettier.js");

describe("throw error if stdin-filepath is not passed", () => {
  runPrettier("cli", "--std-in").test({
    stderr:
      "[error] Cannot use --std-in without also passing --stdin-filepath\n",
  });
});

describe("format the given input if the input matches the file type - JS", () => {
  runPrettier("cli", ["--std-in", "--stdin-filepath", "/foo.js"], {
    input: outdent`
      function hello() {
      return 'world'
      }
    `,
  }).test({
    status: 0,
  });
});

describe("format the given input if the input matches the file type - CSS", () => {
  runPrettier("cli", ["--std-in", "--stdin-filepath", "abc.css"], {
    input: ".name { display: none }",
  }).test({
    status: 0,
  });
});
