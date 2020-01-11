"use strict";

const uniqBy = require("lodash/uniqBy");
const partition = require("lodash/partition");
const fs = require("fs");
const globby = require("globby");
const path = require("path");
const resolve = require("resolve");
const thirdParty = require("./third-party");
const internalPlugins = require("./internal-plugins");

function loadPlugins(plugins, pluginSearchDirs) {
  if (!plugins) {
    plugins = [];
  }

  if (!pluginSearchDirs) {
    pluginSearchDirs = [];
  }
  // unless pluginSearchDirs are provided, auto-load plugins from node_modules that are parent to Prettier
  if (!pluginSearchDirs.length) {
    const autoLoadDir = thirdParty.findParentDir(__dirname, "node_modules");
    if (autoLoadDir) {
      pluginSearchDirs = [autoLoadDir];
    }
  }

  const [externalPluginNames, externalPluginInstances] = partition(
    plugins,
    plugin => typeof plugin === "string"
  );

  const externalManualLoadPluginInfos = externalPluginNames.map(pluginName => {
    let requirePath;
    try {
      // try local files
      requirePath = resolve.sync(path.resolve(process.cwd(), pluginName));
    } catch (e) {
      // try node modules
      requirePath = resolve.sync(pluginName, { basedir: process.cwd() });
    }
    return {
      name: pluginName,
      requirePath
    };
  });

  const externalAutoLoadPluginInfos = pluginSearchDirs
    .map(pluginSearchDir => {
      const resolvedPluginSearchDir = path.resolve(
        process.cwd(),
        pluginSearchDir
      );

      const nodeModulesDir = path.resolve(
        resolvedPluginSearchDir,
        "node_modules"
      );

      // In some fringe cases (ex: files "mounted" as virtual directories), the
      // isDirectory(resolvedPluginSearchDir) check might be false even though
      // the node_modules actually exists.
      if (
        !isDirectory(nodeModulesDir) &&
        !isDirectory(resolvedPluginSearchDir)
      ) {
        throw new Error(
          `${pluginSearchDir} does not exist or is not a directory`
        );
      }

      return findPluginsInNodeModules(nodeModulesDir).map(pluginName => ({
        name: pluginName,
        requirePath: resolve.sync(pluginName, {
          basedir: resolvedPluginSearchDir
        })
      }));
    })
    .reduce((a, b) => a.concat(b), []);

  const externalPlugins = uniqBy(
    externalManualLoadPluginInfos.concat(externalAutoLoadPluginInfos),
    "requirePath"
  )
    .map(externalPluginInfo =>
      Object.assign(
        { name: externalPluginInfo.name },
        eval("require")(externalPluginInfo.requirePath)
      )
    )
    .concat(externalPluginInstances);

  return internalPlugins.concat(externalPlugins);
}

function findPluginsInNodeModules(nodeModulesDir) {
  const pluginPackageJsonPaths = globby.sync(
    [
      "prettier-plugin-*/package.json",
      "@*/prettier-plugin-*/package.json",
      "@prettier/plugin-*/package.json"
    ],
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
