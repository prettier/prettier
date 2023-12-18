import path from "node:path";
import { pathToFileURL } from "node:url";

import mem, { memClear } from "mem";

import importFromDirectory from "../../utils/import-from-directory.js";

function normalizePlugin(pluginInstanceOfPluginModule, name) {
  const plugin =
    pluginInstanceOfPluginModule.default ?? pluginInstanceOfPluginModule;
  return { name, ...plugin };
}

const loadPluginFromDirectory = mem(
  async (name, directory) =>
    normalizePlugin(await importFromDirectory(name, directory), name),
  { cacheKey: JSON.stringify },
);

const importPlugin = mem(async (name) => {
  if (path.isAbsolute(name)) {
    return import(pathToFileURL(name).href);
  }

  try {
    // try local files
    return await import(pathToFileURL(path.resolve(name)).href);
  } catch {
    // try node modules
    return importFromDirectory(name, process.cwd());
  }
});

async function loadPlugin(plugin) {
  if (typeof plugin === "string") {
    return normalizePlugin(await importPlugin(plugin), plugin);
  }

  return plugin;
}

function clearCache() {
  memClear(loadPluginFromDirectory);
  memClear(importPlugin);
}

export { clearCache, loadPlugin, loadPluginFromDirectory };
