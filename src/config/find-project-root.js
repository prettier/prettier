// Simple version of `find-project-root`
// https://github.com/kirstein/find-project-root/blob/master/index.js

import * as path from "node:path";
import { DirectorySearcher, FileSearcher } from "search-closest";

const DIRECTORIES = [".git", ".hg"];
const FILES = [".git"];

/** @type {DirectorySearcher} */
let directorySearcher;
/** @type {FileSearcher} */
let fileSearcher;

function getDistance(startDirectory, result) {
  if (!result) {
    return Number.POSITIVE_INFINITY;
  }

  const relativePath = path.relative(path.dirname(result), startDirectory);
  return relativePath === "" ? 0 : relativePath.split(path.sep).length;
}

/**
 * Find the directory contains a version control system directory
 * @param {string} startDirectory
 * @param {{shouldCache?: boolean}} options
 * @returns {Promise<string | undefined>}
 */
async function findProjectRoot(startDirectory, options) {
  directorySearcher ??= new DirectorySearcher(DIRECTORIES, {
    allowSymlinks: false,
  });
  fileSearcher ??= new FileSearcher(FILES, { allowSymlinks: false });

  const [directory, file] = await Promise.all([
    directorySearcher.search(startDirectory, {
      cache: options.shouldCache,
    }),
    fileSearcher.search(startDirectory, {
      cache: options.shouldCache,
    }),
  ]);

  const root =
    getDistance(startDirectory, file) < getDistance(startDirectory, directory)
      ? file
      : directory;

  return root ? path.dirname(root) : undefined;
}

function clearFindProjectRootCache() {
  directorySearcher?.clearCache();
  fileSearcher?.clearCache();
}

export { clearFindProjectRootCache, findProjectRoot };
