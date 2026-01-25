import consistentEndOfLine from "./consistent-end-of-line.js";
import createSnapshot from "./create-snapshot.js";
import visualizeEndOfLine from "./visualize-end-of-line.js";

/**
@import {TestCase} from "./run-test.js"
*/

/**
@param {TestCase} testCase
@param {string} name
@param {TestCase} testCaseForSnapshot
*/
function testFormat(testCase, name, testCaseForSnapshot) {
  test(name, async () => {
    if (testCase.expectFail) {
      await expect(testCase.runFormat).rejects.toThrowErrorMatchingSnapshot();
      return;
    }

    const formatResult = await testCase.runFormat();
    expect(formatResult).toBeDefined();

    // Make sure output has consistent EOL
    expect(formatResult.eolVisualizedOutput).toBe(
      visualizeEndOfLine(consistentEndOfLine(formatResult.outputWithCursor)),
    );

    if (typeof testCase.expectedOutput === "string") {
      expect(formatResult.eolVisualizedOutput).toBe(testCase.expectedOutput);
      return;
    }

    if (testCase !== testCaseForSnapshot) {
      const { eolVisualizedOutput } = await testCaseForSnapshot.runFormat();
      expect(formatResult.eolVisualizedOutput).toStrictEqual(
        eolVisualizedOutput,
      );
      return;
    }

    expect(
      createSnapshot(formatResult, {
        parsers: testCase.context.explicitParsers,
        formatOptions: testCase.formatOptions,
      }),
    ).toMatchSnapshot();
  });
}

export { testFormat as run };
