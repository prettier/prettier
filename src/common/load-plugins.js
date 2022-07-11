import { createRequire } from "node:module";
import { promises as fsPromises } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fastGlob from "fast-glob";
import mem, { memClear } from "mem";
import partition from "../utils/partition.js";
import uniqByKey from "../utils/uniq-by-key.js";
import thirdParty from "./third-party.js";
import resolve from "./resolve.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

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

  const externalAutoLoadPluginInfos = (
    await Promise.all(
      pluginSearchDirs.map(async (pluginSearchDir) => {
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
          !(await isDirectory(nodeModulesDir)) &&
          !(await isDirectory(resolvedPluginSearchDir))
        ) {
          throw new Error(
            `${pluginSearchDir} does not exist or is not a directory`
          );
        }

        const pluginNames = await memoizedSearch(nodeModulesDir);

        return pluginNames.map((pluginName) => ({
          name: pluginName,
          requirePath: resolve(pluginName, {
            paths: [resolvedPluginSearchDir],
          }),
        }));
      })
    )
  ).flat();

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

  return externalPlugins;
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
    }
  );
  return pluginPackageJsonPaths.map(path.dirname);
}

async function isDirectory(dir) {
  let stat;

  try {
    stat = await fsPromises.stat(dir);
  } catch {
    return false;
  }

  return stat.isDirectory();
}

export { memoizedLoad as loadPlugins, clearCache };
