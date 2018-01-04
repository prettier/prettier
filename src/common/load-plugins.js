"use strict";

const resolve = require("resolve");
const readPkgUp = require("read-pkg-up");

function loadPlugins(plugins) {
  plugins = plugins || [];

  const internalPlugins = [
    require("../language-js"),
    require("../language-css"),
    require("../language-handlebars"),
    require("../language-graphql"),
    require("../language-markdown"),
    require("../language-html"),
    require("../language-vue")
  ];

  const externalPlugins = plugins
    .concat(
      getPluginsFromPackage(
        readPkgUp.sync({
          normalize: false
        }).pkg
      )
    )
    .map(plugin => {
      if (typeof plugin !== "string") {
        return plugin;
      }

      const pluginPath = resolve.sync(plugin, { basedir: process.cwd() });
      return eval("require")(pluginPath);
    });

  return deduplicate(internalPlugins.concat(externalPlugins));
}

function getPluginsFromPackage(pkg) {
  if (!pkg) {
    return [];
  }
  const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
  return Object.keys(deps).filter(
    dep =>
      dep.startsWith("prettier-plugin-") || dep.startsWith("@prettier/plugin-")
  );
}

function deduplicate(items) {
  const uniqItems = [];
  for (const item of items) {
    if (uniqItems.indexOf(item) < 0) {
      uniqItems.push(item);
    }
  }
  return uniqItems;
}

module.exports = loadPlugins;
