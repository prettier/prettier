import { BOM } from "./constants.js";
import { replacePlaceholders } from "./replace-placeholders.js";
import { format } from "./run-prettier.js";

/**
@import {TestCase} from "./run-test.js"
*/

/**
@param {TestCase} testCase
@param {string} name
*/

function testBom(testCase, name) {
  test(name, async () => {
    const { text, options } = replacePlaceholders(
      BOM + testCase.originalText,
      testCase.formatOptions,
    );

    const [formatResult, { eolVisualizedOutput: output }] = await Promise.all([
      testCase.runFormat(),
      format(text, options),
    ]);

    const expected = BOM + formatResult.eolVisualizedOutput;
    expect(output).toBe(expected);
  });
}

/**
@param {TestCase} testCase
@return {boolean}
*/
function shouldSkip(testCase) {
  return testCase.expectFail || testCase.code.charAt(0) === BOM;
}

export { testBom as run, shouldSkip as skip };
