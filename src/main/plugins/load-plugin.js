import path from "node:path";
import { pathToFileURL } from "node:url";
import { isUrl, toPath } from "url-or-path";
import importFromDirectory from "../../utilities/import-from-directory.js";

/**
@param {string | URL} name
@param {string} cwd
*/
async function importPlugin(name, cwd) {
  if (isUrl(name)) {
    // @ts-expect-error -- Pass `URL` to `import()` works too
    return import(name);
  }

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

/**
@param {string | URL} plugin
@param {string} cwd
*/
async function loadPluginWithoutCache(plugin, cwd) {
  const module = await importPlugin(plugin, cwd);
  const implementation = module.default ?? module;
  // TODO: Use plugin name when fixing #17260.
  const name = isUrl(plugin) ? toPath(plugin) : plugin;
  return { name, ...implementation };
}

const cache = new Map();
function loadPlugin(plugin) {
  if (typeof plugin !== "string" && !(plugin instanceof URL)) {
    // TODO: Add name when fixing #17260.
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
