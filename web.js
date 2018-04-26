"use strict";

const version = require("./package.json").version;

const core = require("./src/main/core");
const getSupportInfo = require("./src/main/support").getSupportInfo;

const internalPlugins = [
  require("./src/language-js"),
  require("./src/language-css"),
  require("./src/language-handlebars"),
  require("./src/language-graphql"),
  require("./src/language-markdown"),
  require("./src/language-html"),
  require("./src/language-vue")
];
const externalPlugins = {};

// Luckily `opts` is always the 2nd argument
function withPlugins(fn) {
  return function() {
    const args = Array.from(arguments);
    const opts = args[1] || {};
    args[1] = Object.assign({}, opts, {
      plugins: internalPlugins.concat(
        (opts.plugins || [])
          .map(
            plugin =>
              typeof plugin === "string" ? externalPlugins[plugin] : plugin
          )
          .filter(Boolean)
      )
    });
    return fn.apply(null, args);
  };
}

module.exports = {
  registerPlugin(pluginName, pluginBundle) {
    if (!externalPlugins.hasOwnProperty(pluginName)) {
      externalPlugins[pluginName] = pluginBundle;
    }
  },

  format(text, opts) {
    return withPlugins(core.formatWithCursor)(text, opts).formatted;
  },

  getSupportInfo: withPlugins(getSupportInfo),

  version,

  __debug: {
    parse: withPlugins(core.parse),
    formatAST: withPlugins(core.formatAST),
    formatDoc: withPlugins(core.formatDoc),
    printToDoc: withPlugins(core.printToDoc),
    printDocToString: withPlugins(core.printDocToString)
  }
};
