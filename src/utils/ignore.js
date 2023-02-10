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
 * @returns {string => boolean}
 */
async function createIsIgnoredFunction(ignoreFilePath, withNodeModules) {
  let content = "";

  if (ignoreFilePath) {
    ignoreFilePath = path.resolve(ignoreFilePath);
    content += await readFile(ignoreFilePath);
  }

  if (!withNodeModules) {
    content += "\n" + "node_modules";
  }

  if (!content) {
    return () => false;
  }

  const ignore = createIgnore({ allowRelativePaths: true }).add(content);

  return (filepath) => {
    filepath = path.isAbsolute(filepath) ? filepath : path.resolve(filepath);

    // If there's an ignore-path set, the filename must be relative to the
    // ignore path, not the current working directory.
    const relativePath = ignoreFilePath
      ? path.relative(path.dirname(ignoreFilePath), filepath)
      : path.relative(process.cwd(), filepath);

    return ignore.ignores(slash(relativePath));
  };
}

async function isIgnored(filePath, {ignorePath, withNodeModules}) {
  const isIgnored = await createIsIgnoredFunction(ignorePath, withNodeModules);
  return isIgnored(filePath)
}

export { createIsIgnoredFunction, isIgnored };
