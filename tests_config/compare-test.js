"use strict";

const fs = require("fs");
const path = require("path");
const globby = require("globby");
const { outdent } = require("outdent");
const prettier = require("..");

const PROJECT_ROOT = path.join(__dirname, "..");
const COMPARE_TEST_FIXTURES = path.join(
  path.dirname(require.resolve("@prettier/core-test-fixtures/package.json")),
  "files"
);

function runCompareTest(config) {
  const { patterns, ignore = [], options } = config;

  const files = globby.sync(patterns, {
    cwd: COMPARE_TEST_FIXTURES,
    ignore,
    absolute: true,
  });

  test("files", () => {
    expect(files.length > 0).toBe(true);
    // TODO: Snapshot matched files
    // expect(files).toMatchSnapshot();
  });

  for (const file of files) {
    const relativePath = path.relative(PROJECT_ROOT, file);
    const testTitle = outdent`
      ${relativePath}
      Options: ${JSON.stringify(options)}
    `;

    const optionsWithFilePath = { filepath: file, ...options };
    const input = fs.readFileSync(file, "utf8");

    let ast;
    try {
      ast = prettier.__debug.parse(
        input,
        optionsWithFilePath,
        /* massage */ true
      ).ast;
    } catch {
      continue;
    }

    test(testTitle, () => {
      const output = prettier.format(input, optionsWithFilePath);

      const formattedAst = prettier.__debug.parse(
        output,
        optionsWithFilePath,
        /* massage */ true
      ).ast;

      expect(formattedAst).toEqual(ast);

      // TODO: Compare second output
    });
  }
}

module.exports = { COMPARE_TEST_FIXTURES, runCompareTest };
