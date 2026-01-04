import fs from "node:fs/promises";
import path from "node:path";
import * as prettier from "../../src/index.js";
import getMaxContinuousCount from "../../src/utilities/get-max-continuous-count.js";

async function formatFile(file) {
  file = path.resolve(file);

  const { ignored, inferredParser } = await prettier.getFileInfo(file, {
    ignorePath: [".prettierignore", ".gitignore"],
  });

  if (ignored) {
    return `File '${file}' is ignore by Prettier.`;
  }

  const [config, content] = await Promise.all([
    prettier.resolveConfig(file),
    fs.readFile(file, "utf8"),
  ]);

  const formatted = await prettier.format(content, {
    parser: inferredParser,
    ...config,
    filepath: file,
  });

  if (formatted === content) {
    return `File '${file}' already well formatted by Prettier.`;
  }

  const backtickString = "`".repeat(
    Math.min(getMaxContinuousCount(formatted, "`") + 1, 3),
  );

  return `Formatted code:\n\n${backtickString}\n${formatted}\n${backtickString}`;
}

export { formatFile };
