"use strict";

const version = require("../package.json").version;

const core = require("./main/core");
const getSupportInfo = require("./main/support").getSupportInfo;
const sharedUtil = require("./common/util-shared");

const doc = require("./doc");

const internalPlugins = [
  require("./language-css"),
  require("./language-graphql"),
  require("./language-handlebars"),
  require("./language-html"),
  require("./language-js"),
  require("./language-markdown"),
  require("./language-vue"),
  require("./language-yaml")
];

const isArray =
  Array.isArray ||
  function(arr) {
    return Object.prototype.toString.call(arr) === "[object Array]";
  };

// Luckily `opts` is always the 2nd argument
function withPlugins(fn) {
  return function() {
    const args = Array.from(arguments);
    let plugins = (args[1] && args[1].plugins) || [];
    if (!isArray(plugins)) {
      plugins = Object.values(plugins);
    }
    args[1] = Object.assign({}, args[1], {
      plugins: internalPlugins.concat(plugins)
    });
    return fn.apply(null, args);
  };
}

const formatWithCursor = withPlugins(core.formatWithCursor);

module.exports = {
  formatWithCursor: formatWithCursor,

  format(text, opts) {
    return formatWithCursor(text, opts).formatted;
  },

  check(text, opts) {
    const formatted = formatWithCursor(text, opts).formatted;
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
