import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { default as ts } from "typescript";

describe("Unit tests for dts files", () => {
  const testCasesDirPath = url.fileURLToPath(new URL("cases", import.meta.url));
  const testCaseFiles = fs
    .readdirSync(testCasesDirPath)
    .map((file) => path.join(testCasesDirPath, file));

  /** @type {import("typescript").CompilerOptions} */
  const compilerOptions = { noEmit: true, strict: true };

  const program = ts.createProgram(testCaseFiles, compilerOptions);

  /** @type {{fileName: string; diagnosticMessages: string[]; }[]} */
  const expected = [
    {
      fileName: "index.ts",
      diagnosticMessages: [
        "Argument of type 'number' is not assignable to parameter of type 'string'.",
      ],
    },
    {
      fileName: "foo.ts",
      diagnosticMessages: [],
    },
  ];

  /** @type {import("typescript").Diagnostic[]} */
  const diagnostics = ts.getPreEmitDiagnostics(program);

  /** @type {{fileName: string; diagnosticMessages: string[]; }[]} */
  const actual = expected.map(({ fileName }) => ({
    fileName,
    diagnosticMessages: [],
  }));
  for (const diagnostic of diagnostics) {
    const fileName = path.relative(testCasesDirPath, diagnostic.file.fileName);
    actual
      .find((testCase) => testCase.fileName === fileName)
      ?.diagnosticMessages.push(diagnostic.messageText);
  }

  test.each(expected)("$fileName", ({ fileName, diagnosticMessages }) => {
    const actualTestCase = actual.find(
      (testCase) => testCase.fileName === fileName
    );
    if (actualTestCase) {
      expect(diagnosticMessages).toEqual(actualTestCase.diagnosticMessages);
    }
  });
});
