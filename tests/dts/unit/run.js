import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { default as ts } from "typescript";

const isProduction = process.env.NODE_ENV === "production";

describe("Unit tests for dts files", () => {
  test("no errors", () => {
    const testCasesDirPath = url.fileURLToPath(
      new URL("cases", import.meta.url),
    );
    const testCaseFiles = fs
      .readdirSync(testCasesDirPath)
      // The parsers.ts case uses generated types and therefore requires that
      // `yarn build` has run, so we only include it for production test runs
      .filter((file) => isProduction || file !== "parsers.ts")
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
  return `${location}TS${code}: ${formatMessageText(messageText)}`;
}

/**
 * @param {import("typescript").Diagnostic.messageText} messageText
 * @param Number indent
 *
 * Format the messageText property of a Diagnostic object. This may either
 * simply be a string, or may be a tree of objects each containing a
 * `messageText` string and a `next` property pointing to an array of child
 * nodes. (The tree format gets used when an error is caused by another error.)
 */
function formatMessageText(messageText) {
  if (typeof messageText === "string") {
    return messageText;
  }
  if (messageText.next) {
    return (
      messageText.messageText +
      " (" +
      messageText.next.map(formatMessageText).join("; ") +
      ")"
    );
  }
  return messageText.messageText;
}
