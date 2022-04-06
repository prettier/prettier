"use strict";

const fs = require("fs");
const path = require("path");
const fastGlob = require("fast-glob");
const partition = require("../utils/partition.js");
const uniqByKey = require("../utils/uniq-by-key.js");
const internalPlugins = require("../languages.js");
const { default: mem, memClear } = require("../../vendors/mem.js");
const thirdParty = require("./third-party.js");
const resolve = require("./resolve.js");

const memoizedLoad = mem(load, { cacheKey: JSON.stringify });
const memoizedSearch = mem(findPluginsInNodeModules);
const clearCache = () => {
  memClear(memoizedLoad);
  memClear(memoizedSearch);
};

function load(plugins, pluginSearchDirs) {
  if (!plugins) {
    plugins = [];
  }

  if (pluginSearchDirs === false) {
    pluginSearchDirs = [];
  } else {
    pluginSearchDirs = pluginSearchDirs || [];

    // unless pluginSearchDirs are provided, auto-load plugins from node_modules that are parent to Prettier
    if (pluginSearchDirs.length === 0) {
      const autoLoadDir = thirdParty.findParentDir(__dirname, "node_modules");
      if (autoLoadDir) {
        pluginSearchDirs = [autoLoadDir];
      }
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

      return memoizedSearch(nodeModulesDir).map((pluginName) => ({
        name: pluginName,
        requirePath: resolve(pluginName, { paths: [resolvedPluginSearchDir] }),
      }));
    }
  );

  const externalPlugins = [
    ...uniqByKey(
      [...externalManualLoadPluginInfos, ...externalAutoLoadPluginInfos],
      "requirePath"
    ).map((externalPluginInfo) => ({
      name: externalPluginInfo.name,
      ...require(externalPluginInfo.requirePath),
    })),
    ...externalPluginInstances,
  ];

  return [...internalPlugins, ...externalPlugins];
}

function findPluginsInNodeModules(nodeModulesDir) {
  const pluginPackageJsonPaths = fastGlob.sync(
    [
      "prettier-plugin-*/package.json",
      "@*/prettier-plugin-*/package.json",
      "@prettier/plugin-*/package.json",
    ],
    {
      cwd: nodeModulesDir,
    }
  );
  return pluginPackageJsonPaths.map(path.dirname);
}

function isDirectory(dir) {
  try {
    return fs.statSync(dir).isDirectory();
  } catch {
    return false;
  }
}

module.exports = {
  loadPlugins: memoizedLoad,
  clearCache,
};
