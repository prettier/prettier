"use strict";

const runPrettier = require("../runPrettier");

describe("requiring a pragma of @format", () => {
  test("skipping over files without the pragma", () => {
    const result = runPrettier("cli/require-pragma", [
      "module-without-pragma.js",
      '--require-pragma="format"'
    ]);

    expect(result.stdout).toMatchSnapshot();
    expect(result.status).toEqual(0);
  });

  test("formatting files with the pragma", () => {
    const result = runPrettier("cli/require-pragma", [
      "module-with-pragma.js",
      '--require-pragma="format"'
    ]);

    expect(result.stdout).toMatchSnapshot();
    expect(result.status).toEqual(0);
  });
});
