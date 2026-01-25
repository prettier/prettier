import * as failedTests from "./failed-format-tests.js";
import { format } from "./run-prettier.js";
import { testAstCompare } from "./test-ast-compare.js";
import { testBom } from "./test-bom.js";
import { testEndOfLine } from "./test-end-of-line.js";
import { testFormat } from "./test-format.js";
import { testSecondFormat } from "./test-second-format.js";
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

  const testCases = parsers
    .filter((parser) => !failedTests.shouldDisable(filepath, parser))
    .map((parser) => getTestCase(fixture, parser));

  const testCaseForSnapshot = testCases.find(
    (testCase) =>
      !testCase.expectFail && typeof testCase.expectedOutput !== "string",
  );
  const hasMultipleParsers = testCases.length > 1;

  describe(title, () => {
    for (const functionality of [
      {
        name(testCase) {
          let name = "format";
          // Avoid parser display in snapshot
          if (testCaseForSnapshot !== testCase && hasMultipleParsers) {
            name += ` [${testCase.parser}]`;
          }
          return name;
        },
        test: (testCase, name) =>
          testFormat(testCase, name, testCaseForSnapshot),
      },
      { name: "ast compare", test: testAstCompare },
      // The following cases only need run on main parser
      {
        name: "second format",
        test: testSecondFormat,
        skip: (testCase) => testCase !== testCaseForSnapshot,
      },
      {
        name: "end of line (CRLF)",
        test: (testCase, name) => testEndOfLine(testCase, name, "\r\n"),
        skip: (testCase) => testCase !== testCaseForSnapshot,
      },
      {
        name: "end of line (CR)",
        test: (testCase, name) => testEndOfLine(testCase, name, "\r"),
        skip: (testCase) => testCase !== testCaseForSnapshot,
      },
      {
        name: "BOM",
        test: testBom,
        skip: (testCase) => testCase !== testCaseForSnapshot,
      },
    ]) {
      for (const testCase of testCases) {
        if (functionality.skip?.(testCase)) {
          continue;
        }

        let { name } = functionality;
        if (typeof name === "function") {
          name = name(testCase);
        } else if (hasMultipleParsers) {
          name += ` [${testCase.parser}]`;
        }

        functionality.test(testCase, name);
      }
    }
  });
}

/**
@param {Fixture} fixture
@param {string} parser
*/
function getTestCase(fixture, parser) {
  const { code, context, filepath } = fixture;
  const { options } = context;
  const formatOptions = { filepath, ...options, parser };
  const expectFail = shouldThrowOnFormat(fixture, options, parser);
  /** @type {ReturnType<format> | undefined} */
  let promise;

  return {
    context,
    parser,
    filepath,
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
