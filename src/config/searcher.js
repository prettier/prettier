import path from "node:path";
import iterateDirectoryUp from "iterate-directory-up";

class Searcher {
  #names;
  #filter;
  #stopDirectory;
  #cache = new Map();

  /**
   * @param {{
   *   names: string[],
   *   filter: (fileOrDirectory: {name: string, path: string}) => Promise<boolean>,
   *   stopDirectory?: string,
   * }} param0
   */
  constructor({ names, filter, stopDirectory }) {
    this.#names = names;
    this.#filter = filter;
    this.#stopDirectory = stopDirectory;
  }

  async #searchInDirectory(directory, shouldCache) {
    const cache = this.#cache;
    if (shouldCache && cache.has(directory)) {
      return cache.get(directory);
    }

    for (const name of this.#names) {
      const fileOrDirectory = path.join(directory, name);

      if (await this.#filter({ name, path: fileOrDirectory })) {
        return fileOrDirectory;
      }
    }
  }

  async search(startDirectory, { shouldCache }) {
    const cache = this.#cache;
    if (shouldCache && cache.has(startDirectory)) {
      return cache.get(startDirectory);
    }

    const searchedDirectories = [];
    let result;
    for (const directory of iterateDirectoryUp(
      startDirectory,
      this.#stopDirectory,
    )) {
      searchedDirectories.push(directory);
      result = await this.#searchInDirectory(directory, shouldCache);

      if (result) {
        break;
      }
    }

    // Always cache the result, so we can use it when `useCache` is set to true
    for (const directory of searchedDirectories) {
      cache.set(directory, result);
    }

    return result;
  }

  clearCache() {
    this.#cache.clear();
  }
}

export default Searcher;
