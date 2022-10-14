import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fastGlob from "fast-glob";
import mem, { memClear } from "mem";
import partition from "../utils/partition.js";
import importFromDirectory from "../utils/import-from-directory.js";
import findProjectRoot from "../config/find-project-root.js";
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
  plugins ??= [];

  if (pluginSearchDirs === false) {
    pluginSearchDirs = [];
  } else {
    pluginSearchDirs ??= [];

    // unless pluginSearchDirs are provided, auto-load plugins from node_modules that are parent to Prettier
    if (pluginSearchDirs.length === 0) {
      // This is likely the project root. In projects using pnpm, this directory is named "prettier@<version>".
      let autoLoadDir = thirdParty.findParentDir(__dirname, "node_modules");
      autoLoadDir = autoLoadDir ? path.resolve(autoLoadDir) : ""; // Make sure autoLoadDir isn't null.'

      const isProjectRoot = findProjectRoot(__dirname) === autoLoadDir; // Make sure we don't go outside projectRoot.

      // Get the parent directory of autoLoadDir.
      // It will be the pnpm virtual store if we're not at the project root and if autoLoadDirectory starts with "prettier@".
      const pnpmVirtualStore =
        !isProjectRoot &&
        path.basename(autoLoadDir).startsWith("prettier@") &&
        path.dirname(autoLoadDir);

      const pnpmVirtualStoreSearchDirectories =
        pnpmVirtualStore &&
        (await findPluginDirsInPnpmVirtualStore(pnpmVirtualStore));

      if (autoLoadDir) {
        pluginSearchDirs = [autoLoadDir];
      }

      // Use instead of autoLoadDir if valid.
      if (pnpmVirtualStoreSearchDirectories.length > 0) {
        pluginSearchDirs = pnpmVirtualStoreSearchDirectories;
      }
    }
  }

  const [externalPluginNames, externalPluginInstances] = partition(
    plugins,
    (plugin) => typeof plugin === "string"
  );

  const externalManualLoadPlugins = await Promise.all(
    externalPluginNames.map(async (name) => {
      try {
        // try local files
        const module = await import(pathToFileURL(path.resolve(name)).href);
        const plugin = module.default ?? module;
        return { name, ...plugin };
      } catch {
        // try node modules
        return importPlugin(name, process.cwd());
      }
    })
  );

  const externalAutoLoadPlugins = (
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

        const foundNodeModulesDir = await isDirectory(nodeModulesDir);

        // In some fringe cases (ex: files "mounted" as virtual directories), the
        // isDirectory(resolvedPluginSearchDir) check might be false even though
        // the node_modules actually exists.
        if (
          !foundNodeModulesDir &&
          !(await isDirectory(resolvedPluginSearchDir))
        ) {
          throw new Error(
            `${pluginSearchDir} does not exist or is not a directory`
          );
        }

        // If we find node_modules, use that directory. Otherwise use passed search directory.
        const searchDirectory = foundNodeModulesDir
          ? nodeModulesDir
          : resolvedPluginSearchDir;

        const pluginNames = await memoizedSearch(searchDirectory);

        return Promise.all(
          pluginNames.map((name) => importPlugin(name, searchDirectory))
        );
      })
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
    }
  );
  return pluginPackageJsonPaths.map(path.dirname);
}

async function findPluginDirsInPnpmVirtualStore(searchDirectory) {
  const pluginPackageJsonPaths = await fastGlob(
    ["prettier-plugin-*", "@prettier+plugin-*", "@*+prettier-plugin-*"],
    {
      cwd: searchDirectory,
      onlyDirectories: true,
    }
  );

  return pluginPackageJsonPaths.map((match) =>
    path.resolve(searchDirectory, match)
  );
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
