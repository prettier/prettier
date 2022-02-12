import createEsmUtils from "esm-utils";
import core from "./main/core.js";
import { getSupportInfo } from "./main/support.js";
import getFileInfo from "./common/get-file-info.js";
import sharedUtil from "./common/util-shared.js";
import plugins from "./common/load-plugins.js";
import config from "./config/resolve-config.js";
import doc from "./document/index.js";

const { require } = createEsmUtils(import.meta);

const { version } = require("../package.json");

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

const prettier = {
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
      getLast: require("./utils/get-last.js"),
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

export default prettier;
