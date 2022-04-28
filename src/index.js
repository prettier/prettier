import { createRequire } from "node:module";
import core from "./main/core.js";
import { getSupportInfo as getSupportInfoWithoutPlugins } from "./main/support.js";
import getFileInfoWithoutPlugins from "./common/get-file-info.js";
import * as sharedUtil from "./common/util-shared.js";
import {
  loadPlugins,
  clearCache as clearPluginCache,
} from "./common/load-plugins.js";
import {
  resolveConfig,
  resolveConfigFile,
  clearCache as clearConfigCache,
} from "./config/resolve-config.js";
import doc from "./document/index.js";
import languages from "./languages.js";

import * as errors from "./common/errors.js";
import * as coreOptions from "./main/core-options.js";
import createIgnorer from "./common/create-ignorer.js";
import * as optionsModule from "./main/options.js";
import * as optionsNormalizer from "./main/options-normalizer.js";
import arrayify from "./utils/arrayify.js";
import getLast from "./utils/get-last.js";
import partition from "./utils/partition.js";
import { isNonEmptyArray } from "./common/util.js";

const require = createRequire(import.meta.url);

const { version } = require("../package.json");

function _withPlugins(
  fn,
  optsArgIdx = 1 // Usually `opts` is the 2nd argument
) {
  return (...args) => {
    const opts = args[optsArgIdx] || {};
    args[optsArgIdx] = {
      ...opts,
      plugins: [
        ...languages,
        ...loadPlugins(opts.plugins, opts.pluginSearchDirs),
      ],
    };
    return fn(...args);
  };
}

/**
 * @param {*} fn
 * @param {*} optsArgIdx
 * @returns {*}
 */
function withPlugins(fn, optsArgIdx) {
  const resultingFn = _withPlugins(fn, optsArgIdx);
  if (fn.sync) {
    // @ts-expect-error
    resultingFn.sync = _withPlugins(fn.sync, optsArgIdx);
  }
  return resultingFn;
}

const formatWithCursor = withPlugins(core.formatWithCursor);

function format(text, opts) {
  return formatWithCursor(text, opts).formatted;
}

function check(text, opts) {
  const { formatted } = formatWithCursor(text, opts);
  return formatted === text;
}

function clearCache() {
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
  optionsModule,
  optionsNormalizer,
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
  version,
  formatWithCursor,
  format,
  check,
  doc,
  resolveConfig,
  resolveConfigFile,
  // TODO: Expose this as `clearCache` in v3
  clearCache as clearConfigCache,
  getFileInfo,
  getSupportInfo,
  sharedUtil as util,
  sharedWithCli as __internal,
  debugApis as __debug,
};
