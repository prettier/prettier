"use strict";

const runPrettier = require("../runPrettier");

test("exits with non-zero code when input has a syntax error", () => {
  const result = runPrettier("cli/with-shebang", ["--stdin"], {
    input: "a.2"
  });

  expect(result.status).toEqual(2);
});
