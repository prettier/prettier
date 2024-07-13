import path from "node:path";
import url from "node:url";
import ignoreModule from "ignore";
import { isUrl, toPath } from "url-or-path";
import readFile from "../utils/read-file.js";

const createIgnore = ignoreModule.default;
/** @type {(filePath: string) => string} */
const slash =
  path.sep === "\\"
    ? (filePath) => filePath.replaceAll("\\", "/")
    : (filePath) => filePath;

/**
 * @param {string | URL} file
 * @param {string | URL | undefined} ignoreFile
 * @returns {string}
 */
function getRelativePath(file, ignoreFile) {
  const ignoreFilePath = toPath(ignoreFile);
  const filePath = isUrl(file) ? url.fileURLToPath(file) : path.resolve(file);

  return path.relative(
    // If there's an ignore-path set, the filename must be relative to the
    // ignore path, not the current working directory.
    ignoreFilePath ? path.dirname(ignoreFilePath) : process.cwd(),
    filePath,
  );
}

/**
 * @param {string | URL | undefined} ignoreFile
 * @param {boolean} [withNodeModules]
 * @returns {Promise<(file: string | URL) => boolean>}
 */
async function createSingleIsIgnoredFunction(ignoreFile, withNodeModules) {
  let content = "";

  if (ignoreFile) {
    content += (await readFile(ignoreFile)) ?? "";
  }

  if (!withNodeModules) {
    content += "\n" + "node_modules";
  }

  if (!content) {
    return;
  }

  const ignore = createIgnore({ allowRelativePaths: true }).add(content);

  return (file) => ignore.ignores(slash(getRelativePath(file, ignoreFile)));
}

/**
 * @param {(string | URL)[]} ignoreFiles
 * @param {boolean?} withNodeModules
 * @returns {Promise<(file: string | URL) => boolean>}
 */
async function createIsIgnoredFunction(ignoreFiles, withNodeModules) {
  // If `ignoreFilePaths` is empty, we still want `withNodeModules` to work
  if (ignoreFiles.length === 0 && !withNodeModules) {
    ignoreFiles = [undefined];
  }

  const isIgnoredFunctions = (
    await Promise.all(
      ignoreFiles.map((ignoreFile) =>
        createSingleIsIgnoredFunction(ignoreFile, withNodeModules),
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
  const { ignorePath: ignoreFiles, withNodeModules } = options;
  const isIgnored = await createIsIgnoredFunction(ignoreFiles, withNodeModules);
  return isIgnored(file);
}

export { createIsIgnoredFunction, isIgnored };
