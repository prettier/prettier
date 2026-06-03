// Simple version of `find-project-root`
// https://github.com/kirstein/find-project-root/blob/master/index.js

import * as path from "node:path";
import { Searcher } from "search-closest";

const DIRECTORIES = [".git", ".hg"];
const FILES = [
  ".git", // Git can be a file when the repository is a submodule or a working tree
];

/** @type {Searcher} */
let searcher;

/**
 * Find the directory contains a version control system directory
 * @param {string} startDirectory
 * @param {{shouldCache?: boolean}} options
 * @returns {Promise<string | undefined>}
 */
async function findProjectRoot(startDirectory, options) {
  searcher ??= new Searcher(DIRECTORIES.concat(FILES), {
    filter: ({ name, stats }) => {
      if (stats.isDirectory()) {
        return DIRECTORIES.includes(name);
      }
      return FILES.includes(name);
    },
  });

  const anchor = await searcher.search(startDirectory, {
    cache: options.shouldCache,
  });

  return anchor ? path.dirname(anchor) : undefined;
}

function clearFindProjectRootCache() {
  searcher.clearCache();
}

export { clearFindProjectRootCache, findProjectRoot };
