import core from "./main/core.js";
import { getSupportInfo as getSupportInfoWithoutPlugins } from "./main/support.js";
import getFileInfoWithoutPlugins from "./common/get-file-info.js";
import {
  loadPlugins,
  clearCache as clearPluginCache,
} from "./common/load-plugins.js";
import {
  resolveConfig,
  resolveConfigFile,
  clearCache as clearConfigCache,
} from "./config/resolve-config.js";
import * as languages from "./languages.js";
import * as errors from "./common/errors.js";
import * as coreOptions from "./main/core-options.js";
import createIgnorer from "./common/create-ignorer.js";
import { hiddenDefaults as optionsHiddenDefaults } from "./main/options.js";
import {
  normalizeApiOptions,
  normalizeCliOptions,
} from "./main/options-normalizer.js";
import { arrayify, getLast, partition } from "./utils/index.js";
import { isNonEmptyArray } from "./common/util.js";

const builtinPlugins = Object.values(languages);

/**
 * @param {*} fn
 * @param {*} optsArgIdx
 * @returns {*}
 */
function withPlugins(
  fn,
  optsArgIdx = 1 // Usually `opts` is the 2nd argument
) {
  return async (...args) => {
    const opts = args[optsArgIdx] || {};

    args[optsArgIdx] = {
      ...opts,
      plugins: [
        ...builtinPlugins,
        ...(await loadPlugins(opts.plugins, opts.pluginSearchDirs)),
      ],
    };
    return fn(...args);
  };
}

const formatWithCursor = withPlugins(core.formatWithCursor);

async function format(text, options) {
  const { formatted } = await formatWithCursor(text, {
    ...options,
    cursorOffset: -1,
  });
  return formatted;
}

async function check(text, options) {
  return (await format(text, options)) === text;
}

// eslint-disable-next-line require-await
async function clearCache() {
  clearConfigCache();
  clearPluginCache();
}

/** @type {typeof getFileInfoWithoutPlugins} */
const getFileInfo = withPlugins(getFileInfoWithoutPlugins);

/** @type {typeof getSupportInfoWithoutPlugins} */
const getSupportInfo = withPlugins(getSupportInfoWithoutPlugins, 0);

// Internal shared with cli
const sharedWithCli = {
  errors,
  coreOptions,
  createIgnorer,
  optionsHiddenDefaults,
  normalizeApiOptions,
  normalizeCliOptions,
  getSupportInfoWithoutPlugins,
  utils: {
    arrayify,
    getLast,
    isNonEmptyArray,
    partition,
  },
};

const debugApis = {
  parse: withPlugins(core.parse),
  formatAST: withPlugins(core.formatAST),
  formatDoc: withPlugins(core.formatDoc),
  printToDoc: withPlugins(core.printToDoc),
  printDocToString: withPlugins(core.printDocToString),
};

export {
  formatWithCursor,
  format,
  check,
  resolveConfig,
  resolveConfigFile,
  clearCache as clearConfigCache,
  getFileInfo,
  getSupportInfo,
  sharedWithCli as __internal,
  debugApis as __debug,
};
export * as util from "./common/util-shared.js";
export * as doc from "./document/index.js";
export { default as version } from "./main/version.evaluate.js";
