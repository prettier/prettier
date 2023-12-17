import path from "node:path";

import mockable from "../../common/mockable.js";
import ConfigSearcher from "./config-searcher.js";
import loadConfigWithoutCache from "./load-config.js";

const loadCache = new Map();
const searchCache = new Map();
function clearCache() {
  loadCache.clear();
  searchCache.clear();
}

/**
 * @param {string} configFile
 * @param {{shouldCache?: boolean}} param1
 * @returns {Promise<ReturnType<loadConfigWithoutCache>>}
 */
function loadConfig(configFile, { shouldCache }) {
  configFile = path.resolve(configFile);
  if (!shouldCache || !loadCache.has(configFile)) {
    const promise = loadConfigWithoutCache(configFile);
    // Even if `shouldCache` is false, we still cache it, so we can use it later
    loadCache.set(configFile, promise);
    return promise;
  }

  return loadCache.get(configFile);
}

/**
 * @param {{shouldCache?: boolean, stopDirectory?: string}} param0
 */
function getSearchFunction({ shouldCache, stopDirectory }) {
  stopDirectory = stopDirectory ? path.resolve(stopDirectory) : undefined;
  const searchCacheKey = JSON.stringify({ shouldCache, stopDirectory });

  if (!searchCache.has(searchCacheKey)) {
    const searcher = new ConfigSearcher({ shouldCache, stopDirectory });
    const searchFunction = searcher.search.bind(searcher);

    searchCache.set(searchCacheKey, searchFunction);
  }

  return searchCache.get(searchCacheKey);
}

/**
 * @param {string} startDirectory
 * @param {{shouldCache?: boolean, stopDirectory?: string}} options
 * @returns {Promise<string>}
 */
function searchConfig(startDirectory, options = {}) {
  startDirectory = startDirectory
    ? path.resolve(startDirectory)
    : process.cwd();

  options.stopDirectory = mockable.getPrettierConfigSearchStopDirectory();

  const search = getSearchFunction(options);

  return search(startDirectory);
}

export { clearCache, loadConfig, searchConfig };
