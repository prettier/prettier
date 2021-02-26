"use strict";

const fs = require("fs");
const path = require("path");
const globby = require("globby");
const { outdent } = require("outdent");
const stripAnsi = require("strip-ansi");
const prettier = require("..");
const AST_COMPARE_TEST_FIXTURES = path.join(
  __dirname,
  "../tests-ast-compare/fixtures"
);

function runAstCompareTest(config) {
  const { patterns, ignore = [], options } = config;

  const files = globby.sync(patterns, {
    cwd: AST_COMPARE_TEST_FIXTURES,
    ignore,
  });

  for (const file of files) {
    const testTitle = outdent`
      ${file}
      Options: ${JSON.stringify(options)}
    `;

    test(testTitle, () => {
      const optionsWithFilePath = { filepath: file, ...options };
      const input = fs.readFileSync(
        path.join(AST_COMPARE_TEST_FIXTURES, file),
        "utf8"
      );

      let originalAst;
      try {
        originalAst = prettier.__debug.parse(
          input,
          optionsWithFilePath,
          /* massage */ true
        ).ast;
      } catch (error) {
        if (error.message) {
          error.message = stripAnsi(error.message);
        }
        expect({ input, options, error }).toMatchSnapshot();
        return;
      }

      const output = prettier.format(input, optionsWithFilePath);

      const formattedAst = prettier.__debug.parse(
        output,
        optionsWithFilePath,
        /* massage */ true
      ).ast;

      expect(formattedAst).toEqual(originalAst);
    });
  }
}

module.exports = { AST_COMPARE_TEST_FIXTURES, runAstCompareTest };
