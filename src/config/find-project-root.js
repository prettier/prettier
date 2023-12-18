// Simple version of `find-project-root`
// https://github.com/kirstein/find-project-root/blob/master/index.js

import isDirectory from "../utils/is-directory.js";
import Searcher from "./searcher.js";

const MARKERS = [".git", ".hg"];
let searcher;
const searchOptions = {
  names: MARKERS,
  filter: ({ path: directory }) =>
    isDirectory(directory, { allowSymlinks: false }),
};

/**
 * Find the directory contains a version control system directory
 * @param {string} startDirectory
 * @param {{shouldCache?: boolean}} options
 * @returns {Promise<string | undefined>}
 */
function findProjectRoot(startDirectory, options) {
  searcher ??= new Searcher(searchOptions);
  return searcher.search(startDirectory, options);
}

function clearFindProjectRootCache() {
  searcher?.clearCache();
}

export { clearFindProjectRootCache, findProjectRoot };
