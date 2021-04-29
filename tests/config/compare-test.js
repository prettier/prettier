"use strict";

const fs = require("fs");
const path = require("path");
const globby = require("globby");
const { outdent } = require("outdent");
const prettier = require("../..");

const PROJECT_ROOT = path.join(__dirname, "..");
const FIXTURES_PACKAGE_DIRECTORY = path.dirname(
  require.resolve("@prettier/core-test-fixtures/package.json")
);
const FIXTURES_DIRECTORY = path.join(FIXTURES_PACKAGE_DIRECTORY, "files");

function runCompareTest(config) {
  const { patterns, ignore = [], options, skip = [] } = config;
  const skipFiles = new Set(
    skip.map((file) => path.join(FIXTURES_DIRECTORY, file))
  );

  const files = globby.sync(patterns, {
    cwd: FIXTURES_DIRECTORY,
    ignore,
  });

  test("files", () => {
    expect(files.length > 0).toBe(true);
    // TODO: Snapshot matched files
    // expect(files).toMatchSnapshot();
  });

  for (const file of files) {
    const absolutePath = path.join(FIXTURES_DIRECTORY, file);
    const relativeToRoot = path.relative(PROJECT_ROOT, absolutePath);
    const testTitle = outdent`
      ${relativeToRoot.replace(/\\/g, "/")}
      Options: ${JSON.stringify(options)}
    `;

    const optionsWithFilePath = { filepath: absolutePath, ...options };
    const input = fs.readFileSync(absolutePath, "utf8");

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

    (skipFiles.has(absolutePath) ? test.skip : test)(testTitle, () => {
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

module.exports = { FIXTURES_DIRECTORY, runCompareTest };
