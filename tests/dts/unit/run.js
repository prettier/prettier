import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { default as ts } from "typescript";

const isFullTest = Boolean(process.env.FULL_TEST);

describe("Unit tests for dts files", () => {
  test("no errors", () => {
    const testCasesDirPath = url.fileURLToPath(
      new URL("cases", import.meta.url),
    );
    const testCaseFiles = fs
      .readdirSync(testCasesDirPath)
      // The parsers.ts case requires that `yarn build` has been run, so
      // we exclude it by default from test runs to avoid confusing failures
      // when people run the tests locally without running `yarn build`:
      .filter((file) => isFullTest || file !== "parsers.ts")
      .map((file) => path.join(testCasesDirPath, file));

    /** @type {import("typescript").CompilerOptions} */
    const compilerOptions = {
      noEmit: true,
      strict: true,
      esModuleInterop: true,
    };

    const program = ts.createProgram(testCaseFiles, compilerOptions);

    /** @type {import("typescript").Diagnostic[]} */
    const diagnostics = ts.getPreEmitDiagnostics(program);

    expect(diagnostics.map(formatDiagnostic)).toEqual([]);
  });
});

/**
 * @param {import("typescript").Diagnostic} diagnostic
 */
function formatDiagnostic({ file, start, code, messageText }) {
  let location = "";
  if (file) {
    const { line, character } = ts.getLineAndCharacterOfPosition(file, start);
    location = `${file.fileName}:${line + 1}:${character + 1} `;
  }
  return `${location}TS${code}: ${messageText}`;
}
