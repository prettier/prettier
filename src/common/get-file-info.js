import { resolveConfig } from "../config/resolve-config.js";
import { isIgnored } from "../utils/ignore.js";
import inferParser from "../utils/infer-parser.js";

/**
 * @typedef {{ ignorePath?: string | URL | (string | URL)[], withNodeModules?: boolean, plugins: object, resolveConfig?: boolean }} FileInfoOptions
 * @typedef {{ ignored: boolean, inferredParser: string | null }} FileInfoResult
 */

/**
 * @param {string | URL} file
 * @param {FileInfoOptions} options
 * @returns {Promise<FileInfoResult>}
 *
 * Please note that prettier.getFileInfo() expects options.plugins to be an array of paths,
 * not an object. A transformation from this array to an object is automatically done
 * internally by the method wrapper. See withPlugins() in index.js.
 */
async function getFileInfo(file, options) {
  if (typeof file !== "string" && !(file instanceof URL)) {
    throw new TypeError(
      `expect \`file\` to be a string or URL, got \`${typeof file}\``,
    );
  }

  let { ignorePath, withNodeModules } = options;
  // In API we allow single `ignorePath`
  if (!Array.isArray(ignorePath)) {
    ignorePath = [ignorePath];
  }

  const ignored = await isIgnored(file, { ignorePath, withNodeModules });

  let inferredParser;
  if (!ignored) {
    inferredParser = await getParser(file, options);
  }

  return {
    ignored,
    inferredParser: inferredParser ?? null,
  };
}

async function getParser(file, options) {
  let config;
  if (options.resolveConfig !== false) {
    config = await resolveConfig(file, {
      // No need read `.editorconfig`
      editorconfig: false,
    });
  }

  return config?.parser ?? inferParser(options, { physicalFile: file });
}

export default getFileInfo;
