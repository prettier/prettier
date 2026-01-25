import { FULL_TEST } from "./constants.js";
import * as failedTests from "./failed-format-tests.js";
import { parse } from "./run-prettier.js";

/**
@import {TestCase} from "./run-test.js"
*/

/**
@param {TestCase} testCase
@param {string} name
*/
function testAstCompare(testCase, name) {
  if (
    !FULL_TEST ||
    testCase.expectFail ||
    // Some parsers skip parsing empty files
    testCase.isEmpty
  ) {
    return;
  }

  test(name, async () => {
    const formatResult = await testCase.runFormat();

    if (!formatResult.changed) {
      return;
    }

    const { filepath, formatOptions } = testCase;
    const { input, output } = formatResult;
    const [originalAst, formattedAst] = await Promise.all(
      [input, output].map((code) => parse(code, formatOptions)),
    );
    const isAstUnstableTest = failedTests.isAstUnstable(
      filepath,
      formatOptions,
    );

    if (isAstUnstableTest) {
      expect(formattedAst).not.toStrictEqual(originalAst);
    } else {
      expect(formattedAst).toStrictEqual(originalAst);
    }
  });
}

export { testAstCompare };
