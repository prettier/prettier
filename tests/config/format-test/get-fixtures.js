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
    const filename = file.name;
    const filepath = path.join(dirname, filename);
    if (
      !file.isFile() ||
      filename[0] === "." ||
      filename === FORMAT_SCRIPT_FILENAME ||
      // VSCode creates this file sometime https://github.com/microsoft/vscode/issues/105191
      filename === "debug.log" ||
      path.extname(filename) === ".snap"
    ) {
      continue;
    }

    const text = fs.readFileSync(filepath, "utf8");

    verifyFilename(context, filename);

    yield {
      context,
      name: filename,
      filename,
      filepath,
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

    let { output } = testCase;
    if (typeof output === "string") {
      output = visualizeEndOfLine(output);
    }

    testCase.name = `snippet: ${testCase.name || `#${index}`}`;

    yield { context, ...testCase, output };
  }
}

export { getFixtures };
