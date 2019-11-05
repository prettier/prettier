"use strict";

const runPrettier = require("../runPrettier");

describe("outputs error message & exits with error code in case of a duplicate class name", () => {
  runPrettier("cli/with-shebang", ["--stdin", "--parser", "babel"], {
    input: "class A {} class A {}"
  }).test({
    status: 2
  });
});
