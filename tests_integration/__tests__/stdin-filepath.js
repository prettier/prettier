"use strict";

const runPrettier = require("../runPrettier");

describe("format correctly if stdin content compatible with stdin-filepath", () => {
  runPrettier(
    "cli",
    ["--stdin-filepath", "abc.css"],
    { input: ".name { display: none; }" } // css
  ).test({
    status: 0
  });
});

describe("throw error if stdin content incompatible with stdin-filepath", () => {
  runPrettier(
    "cli",
    ["--stdin-filepath", "abc.js"],
    { input: ".name { display: none; }" } // css
  ).test({
    status: "non-zero"
  });
});
