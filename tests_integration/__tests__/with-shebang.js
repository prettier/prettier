"use strict";

const runPrettier = require("../runPrettier");

test("preserves shebang", () => {
  const result = runPrettier("cli/with-shebang", ["issue1890.js"]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(0);
});
