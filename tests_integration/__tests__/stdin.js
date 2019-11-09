"use strict";

const runPrettier = require("../runPrettier");

describe("format correctly if stdin content compatible with stdin-filepath", () => {
  runPrettier("cli", ["--stdin", "--stdin-filepath", "test.css"], {
    stdin: ".name { display: none; }"
  }).test({
    status: 0
  });
});
