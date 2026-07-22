// Simple version of `find-project-root`
// https://github.com/kirstein/find-project-root/blob/master/index.js

import * as path from "node:path";
import { Searcher } from "search-closest";

/** @type {({name: string, type: "directory"} | string)[]} */
const MARKERS = [
  // Git can be a file when the repository is a submodule or a working tree
  ".git",
  { name: ".hg", type: "directory" },
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
  searcher ??= new Searcher(MARKERS, { allowSymlinks: false });

  const marker = await searcher.search(startDirectory, {
    cache: options.shouldCache,
  });

  return marker ? path.dirname(marker) : undefined;
}

function clearFindProjectRootCache() {
  searcher?.clearCache();
}

export { clearFindProjectRootCache, findProjectRoot };
