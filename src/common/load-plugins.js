"use strict";

const fs = require("fs");
const path = require("path");
const uniqBy = require("lodash/uniqBy");
const partition = require("lodash/partition");
const globby = require("globby");
const internalPlugins = require("../languages.js");
const thirdParty = require("./third-party.js");
const resolve = require("./resolve.js");
const { isNonEmptyArray } = require("./util.js");

const nodeModulesPluginCache = new Map();
let loadCache = new WeakMap();

const clearCache = () => {
  nodeModulesPluginCache.clear();
  loadCache = new WeakMap();
};
const defaultPluginSearchDirs = [];
const defaultPlugins = [];

function loadPlugins(plugins, pluginSearchDirs) {
  if (!plugins) {
    plugins = defaultPlugins;
  }

  if (!isNonEmptyArray(pluginSearchDirs)) {
    pluginSearchDirs = defaultPluginSearchDirs;
  }

  const cachedSearchDir = loadCache.get(pluginSearchDirs) || new WeakMap();
  const cachedPlugins = cachedSearchDir.get(plugins);
  if (cachedPlugins) {
    return cachedPlugins;
  }

  // unless pluginSearchDirs are provided, auto-load plugins from node_modules that are parent to Prettier
  if (pluginSearchDirs.length === 0) {
    const autoLoadDir = thirdParty.findParentDir(__dirname, "node_modules");
    if (autoLoadDir) {
      pluginSearchDirs.push(autoLoadDir);
    }
  }

  const [externalPluginNames, externalPluginInstances] = partition(
    plugins,
    (plugin) => typeof plugin === "string"
  );

  const externalManualLoadPluginInfos = externalPluginNames.map(
    (pluginName) => {
      let requirePath;
      try {
        // try local files
        requirePath = resolve(path.resolve(process.cwd(), pluginName));
      } catch {
        // try node modules
        requirePath = resolve(pluginName, { paths: [process.cwd()] });
      }

      return {
        name: pluginName,
        requirePath,
      };
    }
  );

  const externalAutoLoadPluginInfos = pluginSearchDirs.flatMap(
    (pluginSearchDir) => {
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

      return findPluginsInNodeModules(nodeModulesDir).map((pluginName) => ({
        name: pluginName,
        requirePath: resolve(pluginName, { paths: [resolvedPluginSearchDir] }),
      }));
    }
  );

  const externalPlugins = [
    ...uniqBy(
      [...externalManualLoadPluginInfos, ...externalAutoLoadPluginInfos],
      "requirePath"
    ).map((externalPluginInfo) => ({
      name: externalPluginInfo.name,
      ...require(externalPluginInfo.requirePath),
    })),
    ...externalPluginInstances,
  ];

  const result = [...internalPlugins, ...externalPlugins];

  cachedSearchDir.set(plugins, result);
  loadCache.set(pluginSearchDirs, cachedSearchDir);

  return result;
}

function findPluginsInNodeModules(nodeModulesDir) {
  if (nodeModulesPluginCache.has(nodeModulesDir)) {
    return nodeModulesPluginCache.get(nodeModulesDir);
  }

  const pluginPackageJsonPaths = globby.sync(
    [
      "prettier-plugin-*/package.json",
      "@*/prettier-plugin-*/package.json",
      "@prettier/plugin-*/package.json",
    ],
    {
      cwd: nodeModulesDir,
      expandDirectories: false,
    }
  );
  const result = pluginPackageJsonPaths.map(path.dirname);
  nodeModulesPluginCache.set(nodeModulesDir, result);
  return result;
}

function isDirectory(dir) {
  try {
    return fs.statSync(dir).isDirectory();
  } catch {
    return false;
  }
}

module.exports = {
  loadPlugins,
  clearCache,
};
