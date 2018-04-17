"use strict";

const uniqBy = require("lodash.uniqby");
const findUpSync = require("find-up").sync;
const fs = require("fs");
const globby = require("globby");
const path = require("path");
const resolve = require("resolve");

function loadPlugins(plugins, pluginSearchDirs) {
  if (!plugins) {
    plugins = [];
  }

  if (!pluginSearchDirs) {
    pluginSearchDirs = [];
  }
  // unless pluginSearchDirs are provided, auto-load plugins from node_modules that are parent to Prettier
  if (!pluginSearchDirs.length) {
    const autoLoadDir = findUpSync(
      path.resolve(findUpSync(__dirname, "prettier"), ".."),
      "node_modules"
    );
    if (autoLoadDir) {
      pluginSearchDirs.push(autoLoadDir);
    }
  }

  const internalPlugins = [
    require("../language-js"),
    require("../language-css"),
    require("../language-handlebars"),
    require("../language-graphql"),
    require("../language-markdown"),
    require("../language-html"),
    require("../language-vue")
  ];

  const externalPluginInfos = [];

  plugins.map(pluginName => {
    const requirePath = resolve.sync(pluginName, { basedir: process.cwd() });
    externalPluginInfos.push({
      name: pluginName,
      requirePath
    });
  });

  pluginSearchDirs.forEach(pluginSearchDir => {
    const resolvedPluginSearchDir = path.resolve(
      process.cwd(),
      pluginSearchDir
    );

    if (!isDirectory(pluginSearchDir)) {
      throw new Error(
        `${pluginSearchDir} does not exist or is not a directory`
      );
    }

    const nodeModulesDir = path.resolve(
      resolvedPluginSearchDir,
      "node_modules"
    );

    findPluginsInNodeModules(nodeModulesDir).map(pluginName => {
      const requirePath = resolve.sync(pluginName, {
        basedir: resolvedPluginSearchDir
      });
      externalPluginInfos.push({
        name: pluginName,
        requirePath
      });
    });
  });

  const externalPlugins = uniqBy(externalPluginInfos, "requirePath").map(
    externalPluginInfo =>
      Object.assign(
        { name: externalPluginInfo.name },
        eval("require")(externalPluginInfo.requirePath)
      )
  );

  return internalPlugins.concat(externalPlugins);
}

function findPluginsInNodeModules(nodeModulesDir) {
  const pluginPackageJsonPaths = globby.sync(
    ["prettier-plugin-*/package.json", "@prettier/plugin-*/package.json"],
    { cwd: nodeModulesDir }
  );
  return pluginPackageJsonPaths.map(path.dirname);
}

function isDirectory(dir) {
  try {
    return fs.statSync(dir).isDirectory();
  } catch (e) {
    return false;
  }
}
module.exports = loadPlugins;
