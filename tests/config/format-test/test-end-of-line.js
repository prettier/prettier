import { replacePlaceholders } from "./replace-placeholders.js";
import { format } from "./run-prettier.js";
import visualizeEndOfLine from "./visualize-end-of-line.js";

/**
@import {TestCase} from "./run-test.js"
*/

/**
@param {TestCase} testCase
@param {string} name
@param {"\r\n" | "\r"} eol
*/
function testEndOfLine(testCase, name, eol) {
  test(name, async () => {
    const { text, options } = replacePlaceholders(
      testCase.originalText.replace(/\n/g, eol),
      testCase.formatOptions,
    );

    const [formatResult, { eolVisualizedOutput: output }] = await Promise.all([
      testCase.runFormat(),
      format(text, options),
    ]);

    const expected =
      options.endOfLine === "auto"
        ? visualizeEndOfLine(
            // All `code` use `LF`, so the `eol` of result is always `LF`
            formatResult.outputWithCursor.replace(/\n/g, eol),
          )
        : formatResult.eolVisualizedOutput;

    expect(output).toBe(expected);
  });
}

/**
@param {TestCase} testCase
@return {boolean}
*/
function shouldSkip(testCase) {
  if (testCase.expectFail || testCase.isEmpty || testCase.code.includes("\r")) {
    return true;
  }

  // They may prevent code been formatted
  const { requirePragma, checkIgnorePragma } = testCase.formatOptions;
  if (requirePragma || checkIgnorePragma) {
    return true;
  }

  // EOL test should not care about these indexes, unless they are directly in the raw options
  const { rangeStart, rangeEnd, cursorOffset } = testCase.context.options;
  if (
    typeof cursorOffset === "number" ||
    typeof rangeStart === "number" ||
    typeof rangeEnd === "number"
  ) {
    return true;
  }

  return false;
}

export { testEndOfLine as run, shouldSkip as skip };
