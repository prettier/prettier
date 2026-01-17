import { resolveConfig } from "../config/resolve-config.js";
import { loadBuiltinPlugins, loadPlugins } from "../main/plugins/index.js";
import { isIgnored } from "../utilities/ignore.js";
import inferParser from "../utilities/infer-parser.js";

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
 * not an object.
 */
async function getFileInfo(file, options = {}) {
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
    inferredParser = options.parser ?? (await getParser(file, options));
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

  if (config?.parser) {
    return config.parser;
  }

  let plugins = options.plugins ?? config?.plugins ?? [];

  // We should wrap this function with `withPlugins` and use `options.plugins` directly instead of loading plugins here
  // See #18375 #18081
  // But somehow it breaks VSCode extension, see #18353
  plugins = (
    await Promise.all([loadBuiltinPlugins(), loadPlugins(plugins)])
  ).flat();

  return inferParser({ plugins }, { physicalFile: file });
}

export default getFileInfo;
