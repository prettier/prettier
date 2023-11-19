import path from "node:path";
import loadConfigWithoutCache from "./load-config.js";
import Searcher from "./search-config.js";

const loadCache = new Map();
const searcherCache = new Map();
function clearCache() {
  loadCache.clear();
  searcherCache.clear();
}

/**
 * @typedef { {config?: any, configFile: string} } Result
 * @typedef {(configFile: string) => Promise<Result>} Load
 * @typedef {(directory: string) => Promise<Result | void>} Search
 */

/**
 * @param {{cache?: boolean, stopDirectory?: string}} param0
 * @returns {{load: Load, search: Search}}
 */

/**
 * @param {string} configFile
 * @param {{cache?: boolean}} param0
 * @returns {Promise<ReturnType<loadConfigWithoutCache>}
 */
function loadConfig(configFile, { cache }) {
  configFile = path.resolve(configFile);
  if (!cache || !loadCache.has(configFile)) {
    const promise = loadConfigWithoutCache(configFile);
    // Even if cache is false, we still cache it, so we can use it later
    loadCache.set(configFile, promise);
    return promise;
  }

  return loadCache.get(configFile);
}

/**
 * @param {string} startDirectory
 * @param {{cache?: boolean, stopDirectory?: string}} param0
 * @returns {Promise<string>}
 */
function searchConfig(startDirectory, { cache, stopDirectory }) {
  stopDirectory = stopDirectory ? path.resolve(stopDirectory) : undefined;
  const searcherCacheKey = JSON.stringify({ cache, stopDirectory });

  startDirectory = startDirectory
    ? path.resolve(startDirectory)
    : process.cwd();

  if (searcherCache.has(searcherCacheKey)) {
    return searcherCache.get(searcherCacheKey).search(startDirectory);
  }

  const searcher = new Searcher({ cache, stopDirectory });
  searcherCache.set(searcherCacheKey, searcher);

  return searcher.search(startDirectory);
}

export { searchConfig, loadConfig, clearCache };
