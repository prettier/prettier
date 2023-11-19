import path from "node:path";
import loadConfigWithoutCache from "./load-config.js";
import ConfigSearcher from "./config-searcher.js";

const loadCache = new Map();
const searchCache = new Map();
function clearCache() {
  loadCache.clear();
  searchCache.clear();
}

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

function getSearchFunction({ cache, stopDirectory }) {
  stopDirectory = stopDirectory ? path.resolve(stopDirectory) : undefined;
  const searchCacheKey = JSON.stringify({ cache, stopDirectory });

  if (!searchCache.has(searchCacheKey)) {
    const searcher = new ConfigSearcher({ cache, stopDirectory });
    const searchFunction = searcher.search.bind(searcher);

    searchCache.set(searchCacheKey, searchFunction);
  }

  return searchCache.get(searchCacheKey);
}

/**
 * @param {string} startDirectory
 * @param {{cache?: boolean, stopDirectory?: string}} param0
 * @returns {Promise<string>}
 */
function searchConfig(startDirectory, options) {
  startDirectory = startDirectory
    ? path.resolve(startDirectory)
    : process.cwd();

  const search = getSearchFunction(options);

  return search(startDirectory);
}

export { searchConfig, loadConfig, clearCache };
