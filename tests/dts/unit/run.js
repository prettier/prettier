import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import { default as ts } from "typescript";

describe("dts", () => {
  test("valid", async () => {
    const validTestCasesDirUrl = new URL("cases/valid", import.meta.url);
    const validTestCaseFiles = (await fs.readdir(validTestCasesDirUrl)).map(
      (file) => path.join(url.fileURLToPath(validTestCasesDirUrl), file)
    );

    /** @type {import("typescript").CompilerOptions} */
    const compilerOptions = { noEmit: true, strict: true };

    const program = ts.createProgram(validTestCaseFiles, compilerOptions);

    /** @type {import("typescript").Diagnostic[]} */
    const diagnostics = [
      ...program.getGlobalDiagnostics(),
      ...program.getSemanticDiagnostics(),
      ...program.getSyntacticDiagnostics(),
      ...program.getDeclarationDiagnostics(),
      ...ts.getPreEmitDiagnostics(program),
    ];

    expect(diagnostics).toEqual([]);
  });
});
