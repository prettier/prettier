import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fastGlob from "fast-glob";
import mem, { memClear } from "mem";
import partition from "../utils/partition.js";
import importFromDirectory from "../utils/import-from-directory.js";
import thirdParty from "./third-party.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const importPlugin = async (name, directory) => {
  const module = await importFromDirectory(name, directory);
  const plugin = module.default ?? module;
  return { name, ...plugin };
};

const memoizedLoad = mem(load, { cacheKey: JSON.stringify });
const memoizedSearch = mem(findPluginsInNodeModules);
const clearCache = () => {
  memClear(memoizedLoad);
  memClear(memoizedSearch);
};

async function load(plugins, pluginSearchDirs) {
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
    (plugin) => typeof plugin === "string",
  );

  const externalManualLoadPlugins = await Promise.all(
    externalPluginNames.map(async (name) => {
      try {
        // try local files
        const url = pathToFileURL(path.resolve(name));
        const module = await import(url);
        const plugin = module.default ?? module;
        return {name, ...plugin};
      } catch {
        // try node modules
        return importPlugin(name, process.cwd());
      }
    }),
  );

  const externalAutoLoadPlugins = (
    await Promise.all(
      pluginSearchDirs.map(async (pluginSearchDir) => {
        const resolvedPluginSearchDir = path.resolve(
          process.cwd(),
          pluginSearchDir,
        );

        const nodeModulesDir = path.resolve(
          resolvedPluginSearchDir,
          "node_modules",
        );

        // In some fringe cases (ex: files "mounted" as virtual directories), the
        // isDirectory(resolvedPluginSearchDir) check might be false even though
        // the node_modules actually exists.
        if (
          !(await isDirectory(nodeModulesDir)) &&
          !(await isDirectory(resolvedPluginSearchDir))
        ) {
          throw new Error(
            `${pluginSearchDir} does not exist or is not a directory`,
          );
        }

        const pluginNames = await memoizedSearch(nodeModulesDir);

        return Promise.all(
          pluginNames.map((name) => importPlugin(name, nodeModulesDir)),
        );
      }),
    )
  ).flat();

  return [
    ...externalManualLoadPlugins,
    ...externalAutoLoadPlugins,
    ...externalPluginInstances,
  ];
}

async function findPluginsInNodeModules(nodeModulesDir) {
  const pluginPackageJsonPaths = await fastGlob(
    [
      "prettier-plugin-*/package.json",
      "@*/prettier-plugin-*/package.json",
      "@prettier/plugin-*/package.json",
    ],
    {
      cwd: nodeModulesDir,
    },
  );
  return pluginPackageJsonPaths.map(path.dirname);
}

async function isDirectory(dir) {
  let stat;

  try {
    stat = await fs.stat(dir);
  } catch {
    return false;
  }

  return stat.isDirectory();
}

export { memoizedLoad as loadPlugins, clearCache };
