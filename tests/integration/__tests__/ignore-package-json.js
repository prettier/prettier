"use strict";

const runPrettier = require("../run-prettier.js");

describe("support prettierIgnore key in package.json", () => {
  runPrettier("cli/ignore-package-json", ["**/*.js", "-l"]).test({
    status: 1,
    stdout: "not-ignored.js\n",
    stderr: "",
  });
});

describe("ignore file when using --debug-check", () => {
  runPrettier("cli/ignore-package-json", ["**/*.js", "--debug-check"]).test({
    status: 0,
    stdout: "not-ignored.js\n",
    stderr: "",
  });
});

describe("outputs files as-is if no --write", () => {
  runPrettier("cli/ignore-package-json", ["ignored.js"], {
    ignoreLineEndings: true,
  }).test({
    status: 0,
    stdout: "'use strict';\n",
    stderr: "",
  });
});
