import { FULL_TEST } from "./constants.js";
import * as failedTests from "./failed-format-tests.js";
import { replacePlaceholders } from "./replace-placeholders.js";
import { format } from "./run-prettier.js";
import * as testAstCompare from "./test-ast-compare.js";
import * as testBom from "./test-bom.js";
import * as testEndOfLine from "./test-end-of-line.js";
import * as testFormat from "./test-format.js";
import * as testSecondFormat from "./test-second-format.js";
import { shouldThrowOnFormat } from "./utilities.js";

/**
@import {Fixture} from "./get-fixtures.js"
@typedef {ReturnType<getTestCase>} TestCase
*/

/**
@param {Fixture} fixture
*/
function testFixture(fixture) {
  const { name, context, filepath } = fixture;
  const { stringifiedOptions, parsers } = context;

  const title = `${name}${
    stringifiedOptions ? ` - ${stringifiedOptions}` : ""
  }`;

  describe(title, () => {
    const testCases = parsers
      .filter((parser) => !failedTests.shouldDisable(filepath, parser))
      .map((parser) => getTestCase(fixture, parser));

    const testCaseForSnapshot = testCases.find(
      (testCase) =>
        !testCase.expectFail && typeof testCase.expectedOutput !== "string",
    );

    const hasMultipleParsers = testCases.length > 1;

    for (const functionality of [
      {
        name(testCase) {
          let name = "format";
          // Avoid parser display in snapshot
          if (testCaseForSnapshot !== testCase && hasMultipleParsers) {
            name += `[${testCase.parser}]`;
          }
          return name;
        },
        test: {
          run: (testCase, name) =>
            testFormat.run(testCase, name, testCaseForSnapshot),
        },
      },
      { name: "ast compare", test: testAstCompare, skip: () => !FULL_TEST },
      // The following cases only need run on main parser
      {
        name: "second format",
        test: testSecondFormat,
        skip: (testCase) => !FULL_TEST || testCase !== testCaseForSnapshot,
      },
      {
        name: "end of line (CRLF)",
        test: {
          ...testEndOfLine,
          run: (testCase, name) => testEndOfLine.run(testCase, name, "\r\n"),
        },
        skip: (testCase) => !FULL_TEST || testCase !== testCaseForSnapshot,
      },
      {
        name: "end of line (CR)",
        test: {
          ...testEndOfLine,
          run: (testCase, name) => testEndOfLine.run(testCase, name, "\r"),
        },
        skip: (testCase) => !FULL_TEST || testCase !== testCaseForSnapshot,
      },
      {
        name: "BOM",
        test: testBom,
        skip: (testCase) => !FULL_TEST || testCase !== testCaseForSnapshot,
      },
    ]) {
      for (const testCase of testCases) {
        if (
          functionality.skip?.(testCase) ||
          functionality.test.skip?.(testCase)
        ) {
          continue;
        }

        let { name } = functionality;
        if (typeof name === "function") {
          name = name(testCase);
        } else if (hasMultipleParsers) {
          name += ` [${testCase.parser}]`;
        }

        functionality.test.run(testCase, name);
      }
    }
  });
}

/**
@param {Fixture} fixture
@param {string} parser
*/
function getTestCase(fixture, parser) {
  const { code: originalText, context, filepath } = fixture;

  const { text: code, options: formatOptions } = replacePlaceholders(
    originalText,
    {
      filepath,
      ...context.options,
      parser,
    },
  );

  const expectFail = shouldThrowOnFormat(fixture, formatOptions);

  /** @type {ReturnType<format> | undefined} */
  let promise;

  return {
    context,
    parser,
    filepath,
    originalText,
    code,
    formatOptions,
    expectFail,
    expectedOutput: fixture.output,
    isEmpty: code.trim() === "",
    runFormat: () =>
      promise === undefined ? (promise = format(code, formatOptions)) : promise,
  };
}

export { testFixture };
