"use strict";

const { version } = require("../package.json");

const core = require("./main/core.js");
const { getSupportInfo } = require("./main/support.js");
const getFileInfo = require("./common/get-file-info.js");
const sharedUtil = require("./common/util-shared.js");
const plugins = require("./common/load-plugins.js");
const config = require("./config/resolve-config.js");
const doc = require("./document/index.js");

function _withPlugins(
  fn,
  optsArgIdx = 1 // Usually `opts` is the 2nd argument
) {
  return (...args) => {
    const opts = args[optsArgIdx] || {};
    args[optsArgIdx] = {
      ...opts,
      plugins: plugins.loadPlugins(opts.plugins, opts.pluginSearchDirs),
    };
    return fn(...args);
  };
}

function withPlugins(fn, optsArgIdx) {
  const resultingFn = _withPlugins(fn, optsArgIdx);
  if (fn.sync) {
    // @ts-expect-error
    resultingFn.sync = _withPlugins(fn.sync, optsArgIdx);
  }
  return resultingFn;
}

const formatWithCursor = withPlugins(core.formatWithCursor);

module.exports = {
  formatWithCursor,

  format(text, opts) {
    return formatWithCursor(text, opts).formatted;
  },

  check(text, opts) {
    const { formatted } = formatWithCursor(text, opts);
    return formatted === text;
  },

  doc,

  resolveConfig: config.resolveConfig,
  resolveConfigFile: config.resolveConfigFile,
  clearConfigCache() {
    config.clearCache();
    plugins.clearCache();
  },

  /** @type {typeof getFileInfo} */
  getFileInfo: withPlugins(getFileInfo),
  /** @type {typeof getSupportInfo} */
  getSupportInfo: withPlugins(getSupportInfo, 0),

  version,

  util: sharedUtil,

  // Internal shared
  __internal: {
    errors: require("./common/errors.js"),
    coreOptions: require("./main/core-options.js"),
    createIgnorer: require("./common/create-ignorer.js"),
    optionsModule: require("./main/options.js"),
    optionsNormalizer: require("./main/options-normalizer.js"),
    utils: {
      arrayify: require("./utils/arrayify.js"),
    },
  },

  /* istanbul ignore next */
  __debug: {
    parse: withPlugins(core.parse),
    formatAST: withPlugins(core.formatAST),
    formatDoc: withPlugins(core.formatDoc),
    printToDoc: withPlugins(core.printToDoc),
    printDocToString: withPlugins(core.printDocToString),
  },
};
