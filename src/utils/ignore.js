import path from "node:path";
import url from "node:url";
import { isUrl } from "url-or-path";
import ignoreModule from "ignore";
import readFile from "../utils/read-file.js";

const createIgnore = ignoreModule.default;
/** @type {(filePath: string) => string} */
const slash =
  path.sep === "\\"
    ? (filePath) => filePath.replaceAll("\\", "/")
    : (filePath) => filePath;

/**
 * @param {string?} ignoreFilePath
 * @param {boolean?} withNodeModules
 * @returns {Promise<(file: string | URL) => boolean>}
 */
async function createSingleIsIgnoredFunction(ignoreFilePath, withNodeModules) {
  let content = "";

  if (ignoreFilePath) {
    content += (await readFile(ignoreFilePath)) ?? "";
  }

  if (!withNodeModules) {
    content += "\n" + "node_modules";
  }

  if (!content) {
    return;
  }

  const ignore = createIgnore({ allowRelativePaths: true }).add(content);

  return (file) => {
    const filePath = isUrl(file)
      ? url.fileURLToPath(file)
      : // @ts-expect-error -- URLs handled by `isUrl`
        path.resolve(file);

    // If there's an ignore-path set, the filename must be relative to the
    // ignore path, not the current working directory.
    const relativePath = ignoreFilePath
      ? path.relative(path.dirname(ignoreFilePath), filePath)
      : path.relative(process.cwd(), filePath);

    return ignore.ignores(slash(relativePath));
  };
}

/**
 * @param {string[]} ignoreFilePaths
 * @param {boolean?} withNodeModules
 * @returns {Promise<(file: string | URL) => boolean>}
 */
async function createIsIgnoredFunction(ignoreFilePaths, withNodeModules) {
  // If `ignoreFilePaths` is empty, we still want `withNodeModules` to work
  if (ignoreFilePaths.length === 0 && !withNodeModules) {
    ignoreFilePaths = [undefined];
  }

  const isIgnoredFunctions = (
    await Promise.all(
      ignoreFilePaths.map((ignoreFilePath) =>
        createSingleIsIgnoredFunction(ignoreFilePath, withNodeModules),
      ),
    )
  ).filter(Boolean);

  return (file) => isIgnoredFunctions.some((isIgnored) => isIgnored(file));
}

/**
 * @param {string | URL} file
 * @param {{ignorePath: string[], withNodeModules?: boolean}} options
 * @returns {Promise<boolean>}
 */
async function isIgnored(file, options) {
  const { ignorePath, withNodeModules } = options;
  const isIgnored = await createIsIgnoredFunction(ignorePath, withNodeModules);
  return isIgnored(file);
}

export { createIsIgnoredFunction, isIgnored };
