"use strict";

const version = require("../package.json").version;

const core = require("./main/core");
const getSupportInfo = require("./main/support").getSupportInfo;
const getFileInfo = require("./common/get-file-info");
const sharedUtil = require("./common/util-shared");
const loadPlugins = require("./common/load-plugins");

const config = require("./config/resolve-config");

const doc = require("./doc");

// Luckily `opts` is always the 2nd argument
function _withPlugins(fn) {
  return function() {
    const args = Array.from(arguments);
    const opts = args[1] || {};
    args[1] = Object.assign({}, opts, {
      plugins: loadPlugins(opts.plugins, opts.pluginSearchDirs)
    });
    return fn.apply(null, args);
  };
}

function withPlugins(fn) {
  const resultingFn = _withPlugins(fn);
  if (fn.sync) {
    resultingFn.sync = _withPlugins(fn.sync);
  }
  return resultingFn;
}

const formatWithCursor = withPlugins(core.formatWithCursor);

module.exports = {
  formatWithCursor,

  format(text, opts) {
    return formatWithCursor(text, opts).formatted;
  },

  check: function(text, opts) {
    const formatted = formatWithCursor(text, opts).formatted;
    return formatted === text;
  },

  doc,

  resolveConfig: config.resolveConfig,
  resolveConfigFile: config.resolveConfigFile,
  clearConfigCache: config.clearCache,

  getFileInfo: withPlugins(getFileInfo),
  getSupportInfo: withPlugins(getSupportInfo),

  version,

  util: sharedUtil,

  /* istanbul ignore next */
  __debug: {
    parse: withPlugins(core.parse),
    formatAST: withPlugins(core.formatAST),
    formatDoc: withPlugins(core.formatDoc),
    printToDoc: withPlugins(core.printToDoc),
    printDocToString: withPlugins(core.printDocToString)
  }
};
