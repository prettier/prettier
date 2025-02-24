// Simple version of `find-project-root`
// https://github.com/kirstein/find-project-root/blob/master/index.js

import * as path from "node:path";
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
async function findProjectRoot(startDirectory, options) {
  searcher ??= new Searcher(searchOptions);
  const mark = await searcher.search(startDirectory, options);

  return mark ? path.dirname(mark) : undefined;
}

function clearFindProjectRootCache() {
  searcher?.clearCache();
}

export { clearFindProjectRootCache, findProjectRoot };
