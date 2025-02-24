import path from "node:path";
import mockable from "../../common/mockable.js";
import getConfigSearcher from "./config-searcher.js";
import loadConfig from "./load-config.js";

const loadCache = new Map();
const searchCache = new Map();
function clearPrettierConfigCache() {
  loadCache.clear();
  searchCache.clear();
}

/**
 * @param {string} configFile
 * @param {{shouldCache?: boolean}} param1
 * @returns {Promise<ReturnType<loadConfig>>}
 */
function loadPrettierConfig(configFile, { shouldCache }) {
  configFile = path.resolve(configFile);

  if (!shouldCache || !loadCache.has(configFile)) {
    // Even if `shouldCache` is false, we still cache the result, so we can use it when `shouldCache` is true
    loadCache.set(configFile, loadConfig(configFile));
  }

  return loadCache.get(configFile);
}

/**
 * @param {string} stopDirectory
 */
function getSearchFunction(stopDirectory) {
  stopDirectory = stopDirectory ? path.resolve(stopDirectory) : undefined;

  if (!searchCache.has(stopDirectory)) {
    const searcher = getConfigSearcher(stopDirectory);
    const searchFunction = searcher.search.bind(searcher);
    searchCache.set(stopDirectory, searchFunction);
  }

  return searchCache.get(stopDirectory);
}

/**
 * @param {string} startDirectory
 * @param {{shouldCache?: boolean}} options
 * @returns {Promise<string>}
 */
function searchPrettierConfig(startDirectory, options = {}) {
  startDirectory = startDirectory
    ? path.resolve(startDirectory)
    : process.cwd();

  const stopDirectory = mockable.getPrettierConfigSearchStopDirectory();

  const search = getSearchFunction(stopDirectory);

  return search(startDirectory, { shouldCache: options.shouldCache });
}

export { clearPrettierConfigCache, loadPrettierConfig, searchPrettierConfig };
