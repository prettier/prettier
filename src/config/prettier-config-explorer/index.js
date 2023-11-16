import path from "node:path";
import { createCachedFunction } from "./common.js";
import loadConfigWithoutCache from "./load-config.js";
import Searcher from "./search-config.js";

const EXPLORER_CACHE = new Map();
function clearCache() {
  EXPLORER_CACHE.clear();
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
function createExplorer({ cache = true, stopDirectory } = {}) {
  stopDirectory = stopDirectory ? path.resolve(stopDirectory) : undefined;

  const explorerCacheKey = JSON.stringify({ cache, stopDirectory });
  if (EXPLORER_CACHE.has(explorerCacheKey)) {
    return EXPLORER_CACHE.get(explorerCacheKey);
  }

  const loadConfig = cache
    ? createCachedFunction(loadConfigWithoutCache)
    : loadConfigWithoutCache;
  const searcher = new Searcher({ stopDirectory, cache });

  const explorer = {
    async load(configFile) {
      configFile = path.resolve(configFile);
      const config = await loadConfig(configFile);
      return { config, configFile };
    },
    async search(directory) {
      directory = directory ? path.resolve(directory) : process.cwd();
      const configFile = await searcher.search(directory);

      if (!configFile) {
        return;
      }

      const config = await loadConfig(configFile);
      return { config, configFile };
    },
  };

  EXPLORER_CACHE.set(explorerCacheKey, explorer);

  return explorer;
}

export { createExplorer, clearCache };
