import path from "node:path";
import iterateDirectoryUp from "iterate-directory-up";
import {
  CONFIG_FILE_NAMES,
  createCachedFunction,
  fileExists,
} from "./common.js";
import { loadConfigFromPackageJson } from "./loaders.js";

async function isPackageJsonFileWithPrettierConfig(file) {
  try {
    return Boolean(await loadConfigFromPackageJson(file));
  } catch {
    return false;
  }
}

async function searchConfigInDirectory(directory) {
  for (const fileName of CONFIG_FILE_NAMES) {
    const file = path.join(directory, fileName);

    if (!(await fileExists(file))) {
      continue;
    }

    if (
      fileName !== "package.json" ||
      (await isPackageJsonFileWithPrettierConfig(file))
    ) {
      return file;
    }
  }
}

/** @type {Map} */ // @ts-expect-error -- intentionally not add the `get` method
const noopMap = { has: () => false, set() {} };
class ConfigSearcher {
  #shouldCache;
  #stopDirectory;
  #searchedFilesStore;
  #searchConfigInDirectory;
  constructor({ stopDirectory, shouldCache }) {
    this.#shouldCache = shouldCache;
    this.#stopDirectory = stopDirectory;
    this.#searchConfigInDirectory = shouldCache
      ? createCachedFunction(searchConfigInDirectory)
      : searchConfigInDirectory;
    this.#searchedFilesStore = shouldCache ? new Map() : noopMap;
  }

  async #searchConfigInDirectories(startDirectory) {
    const store = this.#searchedFilesStore;
    for (const directory of iterateDirectoryUp(
      startDirectory,
      this.#stopDirectory,
    )) {
      // The parent directory may already searched
      if (store.has(directory)) {
        return store.get(directory);
      }

      const file = await this.#searchConfigInDirectory(directory);
      if (file) {
        return file;
      }
    }
  }

  async search(startDirectory) {
    const store = this.#searchedFilesStore;
    if (store.has(startDirectory)) {
      return store.get(startDirectory);
    }

    const configFile = await this.#searchConfigInDirectories(startDirectory);

    // Directories between startDirectory and configFile directory should has the same result
    if (this.#shouldCache) {
      for (const directory of iterateDirectoryUp(
        startDirectory,
        configFile ? path.dirname(configFile) : startDirectory,
      )) {
        store.set(directory, configFile);
      }
    }

    return configFile;
  }
}

export default ConfigSearcher;
