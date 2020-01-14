"use strict";

const { version } = require("../package.json");

const core = require("./main/core");
const { getSupportInfo } = require("./main/support");
const sharedUtil = require("./common/util-shared");

const doc = require("./doc");

const internalPlugins = [
  require("./language-css"),
  require("./language-graphql"),
  require("./language-handlebars"),
  require("./language-html"),
  require("./language-js"),
  require("./language-markdown"),
  require("./language-yaml")
];

// Luckily `opts` is always the 2nd argument
function withPlugins(fn) {
  return function(first, opts, ...rest) {
    const { plugins = [] } = opts || {};

    opts = {
      ...opts,
      plugins: [
        ...internalPlugins,
        ...(Array.isArray(plugins) ? plugins : Object.values(plugins))
      ]
    };

    return fn(first, opts, ...rest);
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

  getSupportInfo: withPlugins(getSupportInfo),

  version,

  util: sharedUtil,

  __debug: {
    parse: withPlugins(core.parse),
    formatAST: withPlugins(core.formatAST),
    formatDoc: withPlugins(core.formatDoc),
    printToDoc: withPlugins(core.printToDoc),
    printDocToString: withPlugins(core.printDocToString)
  }
};
