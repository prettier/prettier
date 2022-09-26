import path from "node:path";
import ignore from "ignore";
import readFile from "../utils/read-file.js";

/**
 * @param {string?} ignoreFilePath
 * @param {boolean?} withNodeModules
 */
async function createIgnorer(ignoreFilePath, withNodeModules) {
  let content;

  if (ignoreFilePath) {
    content = await readFile(path.resolve(ignoreFilePath));
  }

  // @ts-expect-error `ignore` is CommonJS, but its types incorrectly declare a default export.
  // See https://github.com/microsoft/TypeScript/issues/48845
  const ignorer = ignore({ allowRelativePaths: true }).add(content ?? "");
  if (!withNodeModules) {
    ignorer.add("node_modules");
  }

  return ignorer;
}

export default createIgnorer;
