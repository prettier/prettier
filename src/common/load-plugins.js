"use strict";

const resolve = require("resolve");

function loadPlugins(options) {
  const internalPlugins = [
    require("../language-js"),
    require("../language-css"),
    require("../language-graphql"),
    require("../language-markdown"),
    require("../language-html")
  ];

  const externalPlugins = options.plugins.map(plugin => {
    const pluginPath = resolve.sync(plugin, { basedir: process.cwd() });
    return eval("require")(pluginPath);
  });

  return internalPlugins.concat(externalPlugins);
}

module.exports = loadPlugins;
