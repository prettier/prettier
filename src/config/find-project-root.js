// Simple version of `find-project-root`
// https://github.com/kirstein/find-project-root/blob/master/index.js

import * as path from "node:path";
import { DirectorySearcher } from "search-closest";

const DIRECTORIES = [".git", ".hg"];

/** @type {DirectorySearcher} */
let searcher;

/**
 * Find the directory contains a version control system directory
 * @param {string} startDirectory
 * @param {{shouldCache?: boolean}} options
 * @returns {Promise<string | undefined>}
 */
async function findProjectRoot(startDirectory, options) {
  searcher ??= new DirectorySearcher(DIRECTORIES, { allowSymlinks: false });
  const directory = await searcher.search(startDirectory, {
    cache: options.shouldCache,
  });

  return directory ? path.dirname(directory) : undefined;
}

function clearFindProjectRootCache() {
  searcher?.clearCache();
}

export { clearFindProjectRootCache, findProjectRoot };
