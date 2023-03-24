import path from "node:path";
import { fileURLToPath } from "node:url";
import mem, { memClear } from "mem";
import fastGlob from "fast-glob";
import isDirectory from "../../utils/is-directory.js";
import thirdParty from "../../common/third-party.js";
import { loadPluginFromDirectory } from "./load-plugin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const findNodeModules = mem((directory) =>
  thirdParty.findParentDir(directory, "node_modules")
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
  directory = path.resolve(process.cwd(), directory);

  const nodeModulesDir = path.resolve(directory, "node_modules");

  // In some fringe cases (ex: files "mounted" as virtual directories), the
  // isDirectory(directory) check might be false even though
  // the node_modules actually exists.
  if (!(await isDirectory(nodeModulesDir)) && !(await isDirectory(directory))) {
    throw new Error(`${directory} does not exist or is not a directory`);
  }

  const pluginNames = await findPluginsInNodeModules(nodeModulesDir);

  return Promise.all(
    pluginNames.map((name) => loadPluginFromDirectory(name, nodeModulesDir))
  );
});

const searchPlugins = mem(async (pluginSearchDirs = []) => {
  // unless pluginSearchDirs are provided, auto-load plugins from node_modules that are parent to Prettier
  if (pluginSearchDirs.length === 0) {
    const autoLoadDir = findNodeModules(__dirname);
    if (autoLoadDir) {
      pluginSearchDirs = [autoLoadDir];
    }
  }

  return (
    await Promise.all(
      pluginSearchDirs.map((directory) => searchPluginsInDirectory(directory))
    )
  ).flat();
});

function clearCache() {
  memClear(searchPlugins);
  memClear(searchPluginsInDirectory);
  memClear(findPluginsInNodeModules);
  memClear(findNodeModules);
}

export { searchPlugins, clearCache };
