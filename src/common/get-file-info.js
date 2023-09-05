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
  if (ignored) {
    return { ignored: true, inferredParser: null };
  }

  let config;
  if (options.resolveConfig !== false) {
    config = await resolveConfig(filePath);
  }

  if (config.__ignore) {
    return { ignored: true, inferredParser: null };
  }

  return {
    ignored,
    inferredParser:
      config?.parser ??
      inferParser(options, { physicalFile: filePath }) ??
      null,
  };
}

export default getFileInfo;
