import path from "node:path";
import url from "node:url";

import ignoreModule from "ignore";
import { isUrl, toPath } from "url-or-path";

import {
  loadPrettierConfig,
  searchPrettierConfig,
} from "../config/prettier-config/index.js";
import readFile from "../utils/read-file.js";
import isNonEmptyArray from "./is-non-empty-array.js";

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
 * @param {string} filename
 * @returns {Promise<boolean>}
 */
async function isIgnoredFromPrettierConfig(filename) {
  try {
    const configPath = await searchPrettierConfig(filename, {
      shouldCache: true,
    });
    if (!configPath) {
      return false;
    }

    const config = await loadPrettierConfig(configPath, {
      shouldCache: true,
    });
    if (!isNonEmptyArray(config.ignores)) {
      return false;
    }

    const content = config.ignores.join("\n");
    const ignore = createIgnore({ allowRelativePaths: true }).add(content);

    return ignore.ignores(slash(getRelativePath(filename, configPath)));
  } catch {
    return false;
  }
}

/**
 * @param {string | string[]} ignorePatterns
 * @returns {(file: string | URL) => boolean}
 */
function createIsIgnoredFromIgnorePatterns(ignorePatterns) {
  if (Array.isArray(ignorePatterns)) {
    ignorePatterns = ignorePatterns.join("\n");
  }

  const ignore = createIgnore({ allowRelativePaths: true }).add(ignorePatterns);
  return (file) => ignore.ignores(slash(getRelativePath(file, process.cwd())));
}

/**
 * @param {(string | URL)[]} ignoreFiles
 * @param {boolean?} withNodeModules
 * @param {string | string[] | undefined} ignorePatterns
 * @returns {Promise<(file: string | URL) => boolean>}
 */
async function createIsIgnoredFunction(
  ignoreFiles,
  withNodeModules,
  ignorePatterns,
) {
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

  if (ignorePatterns) {
    isIgnoredFunctions.push(createIsIgnoredFromIgnorePatterns(ignorePatterns));
  }

  return async (file) =>
    isIgnoredFunctions.some((isIgnored) => isIgnored(file)) ||
    (await isIgnoredFromPrettierConfig(file));
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
