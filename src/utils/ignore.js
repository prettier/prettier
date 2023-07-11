import path from "node:path";
import ignoreModule from "ignore";
import readFile from "../utils/read-file.js";

const createIgnore = ignoreModule.default;
const slash =
  path.sep === "\\"
    ? (filepath) => filepath.replaceAll("\\", "/")
    : (filepath) => filepath;

/**
 * @param {string?} ignoreFilePath
 * @param {boolean?} withNodeModules
 * @returns {Promise<(string) => boolean>}
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

  return (filepath) => {
    filepath = path.resolve(filepath);

    // If there's an ignore-path set, the filename must be relative to the
    // ignore path, not the current working directory.
    const relativePath = ignoreFilePath
      ? path.relative(path.dirname(ignoreFilePath), filepath)
      : path.relative(process.cwd(), filepath);

    return ignore.ignores(slash(relativePath));
  };
}

/**
 * @param {string[]} ignoreFilePaths
 * @param {boolean?} withNodeModules
 * @returns {Promise<(string) => boolean>}
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

  return (filepath) =>
    isIgnoredFunctions.some((isIgnored) => isIgnored(filepath));
}

/**
 * @param {string[]} filepath
 * @param {{ignorePath: string[], withNodeModules?: boolean}} options
 * @returns {Promise<boolean>}
 */
async function isIgnored(filepath, options) {
  const { ignorePath, withNodeModules } = options;
  const isIgnored = await createIsIgnoredFunction(ignorePath, withNodeModules);
  return isIgnored(filepath);
}

export { createIsIgnoredFunction, isIgnored };
