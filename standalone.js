"use strict";

const version = require("./package.json").version;

const core = require("./src/main/core");
const getSupportInfo = require("./src/main/support").getSupportInfo;
const sharedUtil = require("./src/common/util-shared");

const doc = require("./src/doc");

const internalPlugins = [
  require("./src/language-js"),
  require("./src/language-css"),
  require("./src/language-graphql"),
  require("./src/language-markdown"),
  require("./src/language-vue"),
  require("./src/language-yaml")
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
