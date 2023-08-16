import inferParser from "../utils/infer-parser.js";
import { resolveConfig } from "../config/resolve-config.js";
import { isIgnored } from "../utils/ignore.js";

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
      `expect \`filePath\` to be a string, got \`${typeof filePath}\``,
    );
  }

  let { ignorePath, withNodeModules } = options;
  // In API we allow single `ignorePath`
  if (!Array.isArray(ignorePath)) {
    ignorePath = [ignorePath];
  }

  const ignored = await isIgnored(filePath, { ignorePath, withNodeModules });

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
  if (options.resolveConfig !== false) {
    config = await resolveConfig(filePath);
  }

  return config?.parser ?? inferParser(options, { physicalFile: filePath });
}

export default getFileInfo;
