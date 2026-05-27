import path from "node:path";
import url from "node:url";
import createIgnore from "ignore";
import { isUrl, toPath } from "url-or-path";
import readFile from "./read-file.js";

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

  return (file) =>
    ignore.checkIgnore(slash(getRelativePath(file, ignoreFile))).ignored;
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

const globCharacters = /[*?[\]{}()]/u;

function isCommentOrBlank(line) {
  const trimmed = line.trim();
  return trimmed.length === 0 || trimmed.startsWith("#");
}

function isNegatedPattern(line) {
  return line.trimStart().startsWith("!");
}

function normalizeIgnorePatternForGlob(line, ignoreFile) {
  let pattern = line.trim();

  if (
    !pattern ||
    pattern.startsWith("#") ||
    pattern.startsWith("!") ||
    pattern.includes("\\") ||
    globCharacters.test(pattern)
  ) {
    return [];
  }

  const directoryOnly = pattern.endsWith("/");
  pattern = pattern.replaceAll(/\/+$/gu, "").replaceAll(/^\/+/gu, "");

  if (!pattern || pattern === ".") {
    return [];
  }

  const ignoreFilePath = toPath(ignoreFile);
  const ignoreFileDirectory = ignoreFilePath
    ? slash(path.relative(process.cwd(), path.dirname(ignoreFilePath)))
    : "";
  const hasSlash = pattern.includes("/");
  const basenamePattern = ignoreFileDirectory
    ? path.join(ignoreFileDirectory, "**", pattern)
    : path.join("**", pattern);
  const globPattern = slash(
    hasSlash ? path.join(ignoreFileDirectory, pattern) : basenamePattern,
  );

  return directoryOnly
    ? [`${globPattern}/**`]
    : [globPattern, `${globPattern}/**`];
}

async function createFastGlobIgnorePatterns(ignoreFiles) {
  const patterns = [];

  for (const ignoreFile of ignoreFiles ?? []) {
    if (!ignoreFile) {
      continue;
    }

    const content = await readFile(ignoreFile);
    if (!content) {
      continue;
    }

    const lines = content.split(/\r?\n/u);
    if (
      lines.some((line) => !isCommentOrBlank(line) && isNegatedPattern(line))
    ) {
      continue;
    }

    for (const line of lines) {
      patterns.push(...normalizeIgnorePatternForGlob(line, ignoreFile));
    }
  }

  return patterns;
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

export { createFastGlobIgnorePatterns, createIsIgnoredFunction, isIgnored };
