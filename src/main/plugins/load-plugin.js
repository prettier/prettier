import path from "node:path";
import { pathToFileURL } from "node:url";
import importFromDirectory from "../../utils/import-from-directory.js";

async function importPlugin(name, cwd) {
  if (path.isAbsolute(name)) {
    return import(pathToFileURL(name).href);
  }

  try {
    // try local files
    return await import(pathToFileURL(path.resolve(name)).href);
  } catch {
    // try node modules
    return importFromDirectory(name, cwd);
  }
}

async function loadPluginWithoutCache(plugin, cwd) {
  const module = await importPlugin(plugin, cwd);
  return { name: plugin, ...(module.default ?? module) };
}

const cache = new Map();
function loadPlugin(plugin) {
  if (typeof plugin !== "string") {
    return plugin;
  }

  const cwd = process.cwd();
  const cacheKey = JSON.stringify({ name: plugin, cwd });
  if (!cache.has(cacheKey)) {
    cache.set(cacheKey, loadPluginWithoutCache(plugin, cwd));
  }

  return cache.get(cacheKey);
}

function clearCache() {
  cache.clear();
}

export { clearCache, loadPlugin };
