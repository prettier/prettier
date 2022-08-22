import path from "node:path";
import ignore from "ignore";
import { readFile } from "../utils/index.js";

/**
 * @param {string?} ignoreFilePath
 * @param {boolean?} withNodeModules
 */
async function createIgnorer(ignoreFilePath, withNodeModules) {
  let content;

  if (ignoreFilePath) {
    content = await readFile(path.resolve(ignoreFilePath));
  }

  const ignorer = ignore({ allowRelativePaths: true }).add(content ?? "");
  if (!withNodeModules) {
    ignorer.add("node_modules");
  }

  return ignorer;
}

export default createIgnorer;
