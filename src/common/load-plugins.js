"use strict";

const resolve = require("resolve");

function loadPlugins(options) {
  options = Object.assign({ plugins: [] }, options);

  const internalPlugins = [
    require("../language-js"),
    require("../language-css"),
    require("../language-handlebars"),
    require("../language-graphql"),
    require("../language-markdown"),
    require("../language-html"),
    require("../language-vue")
  ].filter(plugin => {
    return options.plugins.indexOf(plugin) < 0;
  });

  const externalPlugins = options.plugins.map(plugin => {
    if (typeof plugin !== "string") {
      return plugin;
    }

    const pluginPath = resolve.sync(plugin, { basedir: process.cwd() });
    return eval("require")(pluginPath);
  });

  return internalPlugins.concat(externalPlugins);
}

module.exports = loadPlugins;
