import { FULL_TEST } from "./constants.js";
import { format } from "./run-prettier.js";
import visualizeEndOfLine from "./visualize-end-of-line.js";

/**
@import {TestCase} from "./run-test.js"
*/

/**
@param {TestCase} testCase
*/
function testEndOfLine(testCase) {
  if (
    !FULL_TEST ||
    testCase.expectFail ||
    testCase.isEmpty ||
    shouldSkipEolTest(testCase)
  ) {
    return;
  }

  const { code, formatOptions } = testCase;

  for (const eol of ["\r\n", "\r"]) {
    test(`end of line (${JSON.stringify(eol)}) [${testCase.parser}]`, async () => {
      const [formatResult, { eolVisualizedOutput: output }] = await Promise.all(
        [testCase.runFormat(), format(code.replace(/\n/g, eol), formatOptions)],
      );

      // Only if `endOfLine: "auto"` the result will be different
      const expected =
        formatOptions.endOfLine === "auto"
          ? visualizeEndOfLine(
              // All `code` use `LF`, so the `eol` of result is always `LF`
              formatResult.outputWithCursor.replace(/\n/g, eol),
            )
          : formatResult.eolVisualizedOutput;

      expect(output).toBe(expected);
    });
  }
}

/**
@param {TestCase} testCase
@return {boolean}
*/
function shouldSkipEolTest(testCase) {
  if (testCase.code.includes("\r")) {
    return true;
  }

  const { requirePragma, checkIgnorePragma, rangeStart, rangeEnd } =
    testCase.formatOptions;
  if (requirePragma || checkIgnorePragma) {
    return true;
  }

  if (
    typeof rangeStart === "number" &&
    typeof rangeEnd === "number" &&
    rangeStart >= rangeEnd
  ) {
    return true;
  }

  return false;
}

export { testEndOfLine };
