import { FULL_TEST } from "./constants.js";
import * as failedTests from "./failed-format-tests.js";
import { format } from "./run-prettier.js";

/**
@import {TestCase} from "./run-test.js"
*/

/**
@param {TestCase} testCase
@param {string} name
*/
function testSecondFormat(testCase, name) {
  if (!FULL_TEST || testCase.expectFail) {
    return;
  }

  test(name, async () => {
    const formatResult = await testCase.runFormat();

    if (!formatResult.changed) {
      return;
    }

    const { filepath, formatOptions, code } = testCase;

    // No range and cursor
    // TODO[@fisker]: Move this check before format test
    if (formatResult.input === code) {
      return;
    }

    const isUnstableTest = failedTests.isUnstable(filepath, formatOptions);

    const { eolVisualizedOutput: firstOutput, output } = formatResult;
    const { eolVisualizedOutput: secondOutput } = await format(
      output,
      formatOptions,
    );

    if (isUnstableTest && secondOutput === firstOutput) {
      throw new Error(
        `Unstable file '${filepath}' is stable now, please remove from the 'unstableTests' list.`,
      );
    }

    // To keep eye on failed tests, this assert never supposed to pass,
    // if it fails, just remove the file from `unstableTests`
    if (isUnstableTest) {
      expect(secondOutput).not.toBe(firstOutput);
      return;
    }

    expect(secondOutput).toBe(firstOutput);
  });
}

export { testSecondFormat };
