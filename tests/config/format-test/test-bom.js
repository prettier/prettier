import { BOM, FULL_TEST } from "./constants.js";
import { format } from "./run-prettier.js";

/**
@import {TestCase} from "./run-test.js"
*/

/**
@param {TestCase} testCase
@param {string} name
*/

function testBom(testCase, name) {
  if (!FULL_TEST || testCase.expectFail || testCase.code.charAt(0) === BOM) {
    return;
  }

  const { code, formatOptions } = testCase;

  test(name, async () => {
    const [formatResult, { eolVisualizedOutput: output }] = await Promise.all([
      testCase.runFormat(),
      format(BOM + code, formatOptions),
    ]);

    const expected = BOM + formatResult.eolVisualizedOutput;
    expect(output).toBe(expected);
  });
}

export { testBom };
