import consistentEndOfLine from "./consistent-end-of-line.js";
import { BOM, FULL_TEST } from "./constants.js";
import createSnapshot from "./create-snapshot.js";
import * as failedTests from "./failed-format-tests.js";
import { format, parse } from "./run-prettier.js";
import { shouldThrowOnFormat } from "./utilities.js";
import visualizeEndOfLine from "./visualize-end-of-line.js";

/**
@import {Fixture} from "./get-fixtures.js"
*/

/**
@param {Fixture} fixture
*/
function testFixture(fixture) {
  const { name, code, context, filepath } = fixture;
  const { stringifiedOptions, parsers, options } = context;

  const title = `${name}${
    stringifiedOptions ? ` - ${stringifiedOptions}` : ""
  }`;

  const testCases = parsers
    .filter((parser) => !failedTests.shouldDisable(filepath, parser))
    .map((parser) => {
      const formatOptions = { filepath, ...options, parser };
      const expectFail = shouldThrowOnFormat(fixture, options, parser);
      let promise;

      return {
        context,
        parser,
        formatOptions,
        expectFail,
        expectedOutput: fixture.output,
        runFormat: () => (promise ??= format(code, formatOptions)),
      };
    });

  const testCaseForSnapshot = testCases.find(
    (testCase) =>
      !testCase.expectFail && typeof testCase.expectedOutput !== "string",
  );
  const hasMultipleParsers = testCases.length > 1;

  describe(title, () => {
    for (const testCase of testCases) {
      let testTitle = "format";
      if (testCaseForSnapshot !== testCase && hasMultipleParsers) {
        testTitle += `[${testCase.parser}]`;
      }

      test(testTitle, async () => {
        await runTest(testCase, testCaseForSnapshot);
      });
    }
  });
}

async function runTest(testCase, testCaseForSnapshot) {
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
  } else if (testCase === testCaseForSnapshot) {
    expect(
      createSnapshot(formatResult, {
        parsers: testCase.context.explicitParsers,
        formatOptions: testCase.formatOptions,
      }),
    ).toMatchSnapshot();
  } else {
    const { eolVisualizedOutput } = await testCaseForSnapshot.runFormat();
    expect(formatResult.eolVisualizedOutput).toStrictEqual(eolVisualizedOutput);
  }

  if (!FULL_TEST) {
    return;
  }

  const { filepath, code, formatOptions } = testCase;
  // Some parsers skip parsing empty files
  if (formatResult.changed && code.trim()) {
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
  }

  // The following cases should only run on main parser
  if (testCase === testCaseForSnapshot) {
    return;
  }

  const isUnstableTest = failedTests.isUnstable(filepath, formatOptions);
  if (
    (formatResult.changed || isUnstableTest) &&
    // No range and cursor
    formatResult.input === code
  ) {
    const { eolVisualizedOutput: firstOutput, output } = formatResult;
    const { eolVisualizedOutput: secondOutput } = await format(
      output,
      formatOptions,
    );
    if (isUnstableTest) {
      if (secondOutput === firstOutput) {
        throw new Error(
          `Unstable file '${filepath}' is stable now, please remove from the 'unstableTests' list.`,
        );
      }

      // To keep eye on failed tests, this assert never supposed to pass,
      // if it fails, just remove the file from `unstableTests`
      expect(secondOutput).not.toBe(firstOutput);
    } else {
      expect(secondOutput).toBe(firstOutput);
    }
  }

  if (!shouldSkipEolTest(code, formatResult.options)) {
    await Promise.all(
      ["\r\n", "\r"].map(async (eol) => {
        const { eolVisualizedOutput: output } = await format(
          code.replace(/\n/g, eol),
          formatOptions,
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
      }),
    );
  }

  if (code.charAt(0) !== BOM) {
    const { eolVisualizedOutput: output } = await format(
      BOM + code,
      formatOptions,
    );
    const expected = BOM + formatResult.eolVisualizedOutput;
    expect(output).toBe(expected);
  }
}

function shouldSkipEolTest(code, options) {
  if (code.includes("\r")) {
    return true;
  }
  const { requirePragma, checkIgnorePragma, rangeStart, rangeEnd } = options;
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

export { testFixture };
