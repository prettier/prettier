"use strict";

const { version } = require("../package.json");

const core = require("./main/core.js");
const { getSupportInfo } = require("./main/support.js");
const sharedUtil = require("./common/util-shared.js");
const languages = require("./languages.js");
const doc = require("./document/index.js");

function withPlugins(
  fn,
  optsArgIdx = 1 // Usually `opts` is the 2nd argument
) {
  return (...args) => {
    const opts = args[optsArgIdx] || {};
    const plugins = opts.plugins || [];

    args[optsArgIdx] = {
      ...opts,
      plugins: [
        ...languages,
        ...(Array.isArray(plugins) ? plugins : Object.values(plugins)),
      ],
    };

    return fn(...args);
  };
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

  getSupportInfo: withPlugins(getSupportInfo, 0),

  version,

  util: sharedUtil,

  __debug: {
    parse: withPlugins(core.parse),
    formatAST: withPlugins(core.formatAST),
    formatDoc: withPlugins(core.formatDoc),
    printToDoc: withPlugins(core.printToDoc),
    printDocToString: withPlugins(core.printDocToString),
  },
};
