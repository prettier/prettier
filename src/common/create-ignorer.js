import path from "node:path";
import ignore from "ignore";
import getFileContentOrNull from "../utils/get-file-content-or-null.js";

/**
 * @param {string?} ignorePath
 * @param {boolean?} withNodeModules
 */
async function createIgnorer(ignorePath, withNodeModules) {
  const ignoreContent = ignorePath
    ? await getFileContentOrNull(path.resolve(ignorePath))
    : null;

  const ignorer = ignore({ allowRelativePaths: true }).add(ignoreContent || "");
  if (!withNodeModules) {
    ignorer.add("node_modules");
  }
  return ignorer;
}

export default createIgnorer;
