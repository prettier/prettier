import path from "node:path";
import { fileURLToPath } from "node:url";
import mem, { memClear } from "mem";
import fastGlob from "fast-glob";
import isDirectory from "../../utils/is-directory.js";
import mockable from "../../common/mockable.js";
import { loadPluginFromDirectory } from "./load-plugin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const findNodeModules = mem((directory) =>
  mockable.findParentDir(directory, "node_modules")
);

const findPluginsInNodeModules = mem(async (nodeModulesDir) => {
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
});

const searchPluginsInDirectory = mem(async (directory) => {
  const absolutePath = path.resolve(process.cwd(), directory);
  const nodeModulesDir = path.join(absolutePath, "node_modules");

  // In some fringe cases (ex: files "mounted" as virtual directories), the
  // isDirectory(absolutePath) check might be false even though
  // the node_modules actually exists.
  if (
    !(await isDirectory(nodeModulesDir)) &&
    !(await isDirectory(absolutePath))
  ) {
    throw new Error(`${directory} does not exist or is not a directory`);
  }

  const pluginNames = await findPluginsInNodeModules(nodeModulesDir);

  return Promise.all(
    pluginNames.map((name) => loadPluginFromDirectory(name, nodeModulesDir))
  );
});

const searchPlugins = mem(
  async (directories = []) => {
    // unless pluginSearchDirs are provided, auto-load plugins from node_modules that are parent to Prettier
    if (directories.length === 0) {
      const nodeModulesDirectory = findNodeModules(__dirname);
      if (nodeModulesDirectory) {
        directories = [nodeModulesDirectory];
      }
    }

    return (
      await Promise.all(
        directories.map((directory) => searchPluginsInDirectory(directory))
      )
    ).flat();
  },
  { cacheKey: JSON.stringify }
);

function clearCache() {
  memClear(searchPlugins);
  memClear(searchPluginsInDirectory);
  memClear(findPluginsInNodeModules);
  memClear(findNodeModules);
}

export { searchPlugins, clearCache };
