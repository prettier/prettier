"use strict";

const runPrettier = require("../runPrettier");
const prettier = require("../../tests_config/require_prettier");

describe("infers postcss parser", () => {
  runPrettier("cli/with-parser-inference", ["*"]).test({
    status: 0
  });
});

describe("infers postcss parser with --list-different", () => {
  runPrettier("cli/with-parser-inference", ["--list-different", "*"]).test({
    status: 0
  });
});

describe("infers parser from filename", () => {
  test("json from .prettierrc", () => {
    expect(
      prettier.format("  {   }  ", { filepath: "x/y/.prettierrc" })
    ).toEqual("{}\n");
  });

  test("babylon from Jakefile", () => {
    expect(
      prettier.format("let foo = ( x = 1 ) => x", { filepath: "x/y/Jakefile" })
    ).toEqual("let foo = (x = 1) => x;\n");
  });
});
