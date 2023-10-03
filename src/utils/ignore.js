import path from "node:path";
import url from "node:url";
import { isUrl, toPath } from "url-or-path";
import ignoreModule from "ignore";
import mockable from "../common/mockable.js";
import readFile from "../utils/read-file.js";

const { lilconfig } = mockable;

const createExplorer = lilconfig("prettierignore", {
  packageProp: "prettierIgnore",
  searchPlaces: ["package.json"],
  transform(result) {
    if (!result?.config) {
      return result;
    }

    const { config, filepath } = result;

    if (
      !(
        Array.isArray(config) &&
        config.every((entry) => typeof entry === "string")
      )
    ) {
      if (typeof config === "string") {
        result.config = [config];
      } else {
        throw new TypeError(
          "File list is only allowed to be an array of strings, " +
            `but received ${typeof config} in "${filepath}"`,
        );
      }
    }

    return result;
  },
});

const createIgnore = ignoreModule.default;

/** @type {(file: string | URL) => Promise<import('lilconfig').LilconfigResult>} */
const search = (file) => createExplorer.search(toResolvedPath(file));

/** @type {(filePath: string) => string} */
const slash =
  path.sep === "\\"
    ? (filePath) => filePath.replaceAll("\\", "/")
    : (filePath) => filePath;

/**
 * @param {string | URL} file
 * @returns {string}
 */
function toResolvedPath(file) {
  return isUrl(file)
    ? url.fileURLToPath(file)
    : // @ts-expect-error -- URLs handled by `isUrl`
      path.resolve(file);
}

/**
 * @param {string | URL} file
 * @param {string | URL | undefined} ignoreFile
 * @returns {string}
 */
function getRelativePath(file, ignoreFile) {
  const filePath = toResolvedPath(file);
  const ignoreFilePath = toPath(ignoreFile);

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
 * @returns {Promise<(file: string | URL) => Promise<boolean>>}
 */
async function createSingleIsIgnoredFunction(ignoreFile, withNodeModules) {
  let content = "";

  if (ignoreFile) {
    content += (await readFile(ignoreFile)) ?? "";
  }

  if (!withNodeModules) {
    content += "\n" + "node_modules";
  }

  return async (file) =>
    createIgnore({ allowRelativePaths: true })
      .add(content || (await search(file)).config)
      .ignores(slash(getRelativePath(file, ignoreFile)));
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
