import fs from "node:fs";
import path from "node:path";
import { FORMAT_SCRIPT_FILENAME } from "./constants.js";
import { verifyFilename } from "./verify-fixtures.js";
import visualizeEndOfLine from "./visualize-end-of-line.js";

function* getFixtures(context) {
  yield* getFiles(context);
  yield* getSnippets(context);
}

function* getFiles(context) {
  const { dirname } = context;
  for (const file of fs.readdirSync(dirname, { withFileTypes: true })) {
    const basename = file.name;
    const filename = path.join(dirname, basename);
    if (
      path.extname(basename) === ".snap" ||
      !file.isFile() ||
      basename[0] === "." ||
      basename === FORMAT_SCRIPT_FILENAME ||
      // VSCode creates this file sometime https://github.com/microsoft/vscode/issues/105191
      basename === "debug.log"
    ) {
      continue;
    }

    const text = fs.readFileSync(filename, "utf8");

    verifyFilename(context, basename, filename);

    yield {
      context,
      name: basename,
      filename,
      code: text,
    };
  }
}

function* getSnippets(context) {
  for (const [index, snippet] of context.snippets.entries()) {
    const testCase = typeof snippet === "string" ? { code: snippet } : snippet;

    if (typeof testCase.code !== "string") {
      throw Object.assign(new Error("Invalid test"), { testCase });
    }

    if (typeof testCase.output === "string") {
      testCase.output = visualizeEndOfLine(testCase.output);
    }

    testCase.name = `snippet: ${testCase.name || `#${index}`}`;

    yield { context, ...testCase };
  }
}

export { getFixtures };
