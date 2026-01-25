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
  test(name, async () => {
    const {
      changed,
      eolVisualizedOutput: firstOutput,
      output,
    } = await testCase.runFormat();

    if (!changed) {
      return;
    }

    const { filepath, formatOptions } = testCase;

    const { eolVisualizedOutput: secondOutput } = await format(
      output,
      formatOptions,
    );

    const isUnstableTest = failedTests.isUnstable(filepath, formatOptions);
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

function shouldSkip(testCase) {
  if (testCase.expectFail) {
    return true;
  }

  const { rangeStart, rangeEnd, cursorOffset } = testCase.formatOptions;

  // No range and cursor
  if (
    typeof cursorOffset === "number" ||
    typeof rangeStart === "number" ||
    typeof rangeEnd === "number"
  ) {
    return true;
  }

  return false;
}

export { testSecondFormat as run, shouldSkip as skip };
