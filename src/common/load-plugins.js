import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { uniqBy, partition } from "lodash-es";
import fastGlob from "fast-glob";
import mem, { memClear } from "mem";
import thirdParty from "./third-party.cjs";
import resolve from "./resolve.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

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
    ...uniqBy(
      [...externalManualLoadPluginInfos, ...externalAutoLoadPluginInfos],
      "requirePath"
    ).map((externalPluginInfo) => ({
      name: externalPluginInfo.name,
      ...require(externalPluginInfo.requirePath),
    })),
    ...externalPluginInstances,
  ];

  return externalPlugins;
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

export { memoizedLoad as loadPlugins, clearCache };
