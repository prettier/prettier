"use strict";

const runPrettier = require("../runPrettier");

describe("preserves shebang", () => {
  runPrettier("cli/with-shebang", ["issue1890.js"]).test({
    status: 0
  });
});
