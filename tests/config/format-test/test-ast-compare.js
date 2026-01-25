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
  test(name, async () => {
    const formatResult = await testCase.runFormat();

    if (!formatResult.changed) {
      return;
    }

    const [originalAst, formattedAst] = await Promise.all(
      [formatResult.input, formatResult.output].map((code) =>
        parse(code, formatResult.options),
      ),
    );
    const { filepath, formatOptions } = testCase;
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

/**
@param {TestCase} testCase
@return {boolean}
*/
function shouldSkip(testCase) {
  return (
    testCase.expectFail ||
    // Some parsers skip parsing empty files
    testCase.isEmpty
  );
}

export { testAstCompare as run, shouldSkip as skip };
