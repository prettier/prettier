import path from "node:path";
import { inferParser } from "../main/options.js";
import { resolveConfig } from "../config/resolve-config.js";
import createIgnorer from "./create-ignorer.js";

/**
 * @typedef {{ ignorePath?: string, withNodeModules?: boolean, plugins: object, resolveConfig?: boolean }} FileInfoOptions
 * @typedef {{ ignored: boolean, inferredParser: string | null }} FileInfoResult
 */

/**
 * @param {string} filePath
 * @param {FileInfoOptions} options
 * @returns {Promise<FileInfoResult>}
 *
 * Please note that prettier.getFileInfo() expects options.plugins to be an array of paths,
 * not an object. A transformation from this array to an object is automatically done
 * internally by the method wrapper. See withPlugins() in index.js.
 */
async function getFileInfo(filePath, options) {
  if (typeof filePath !== "string") {
    throw new TypeError(
      `expect \`filePath\` to be a string, got \`${typeof filePath}\``
    );
  }

  const ignored = await isIgnored(filePath, options);

  let inferredParser;
  if (!ignored) {
    inferredParser = await getParser(filePath, options);
  }

  return {
    ignored,
    inferredParser: inferredParser ?? null,
  };
}

async function getParser(filePath, options) {
  let config;
  if (options.resolveConfig) {
    config = await resolveConfig(filePath);
  }

  return config?.parser ?? inferParser(filePath, options.plugins);
}

async function isIgnored(filePath, options) {
  const { ignorePath, withNodeModules } = options;

  const ignorer = await createIgnorer(ignorePath, withNodeModules);

  const normalizedFilePath = ignorePath
    ? path.relative(path.dirname(ignorePath), filePath)
    : filePath;

  return ignorer.ignores(normalizedFilePath);
}

export default getFileInfo;
