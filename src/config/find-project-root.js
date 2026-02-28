// Simple version of `find-project-root`
// https://github.com/kirstein/find-project-root/blob/master/index.js

import * as path from "node:path";
import { DirectorySearcher, FileSearcher } from "search-closest";

const DIRECTORIES = [".git", ".hg"];
const FILES = [
  ".git", // Git can be a file when the repository is a submodule or a working tree
];

/** @type {Array<DirectorySearcher|FileSearcher>} */
let searchers;

/**
 * Find the directory contains a version control system directory
 * @param {string} startDirectory
 * @param {{shouldCache?: boolean}} options
 * @returns {Promise<string | undefined>}
 */
async function findProjectRoot(startDirectory, options) {
  searchers ??= [
    new DirectorySearcher(DIRECTORIES, { allowSymlinks: false }),
    new FileSearcher(FILES, { allowSymlinks: false }),
  ];

  const searchResults = await Promise.all(
    searchers.map((searcher) =>
      searcher.search(startDirectory, {
        cache: options.shouldCache,
      }),
    ),
  );

  const closest = searchResults.reduce((acc, candidate) => {
    if (typeof candidate !== "string") {
      return acc;
    }

    if (typeof acc !== "string") {
      return candidate;
    }

    return path.relative(candidate, startDirectory).length <
      path.relative(acc, startDirectory).length
      ? candidate
      : acc;
  });

  return closest ? path.dirname(closest) : undefined;
}

function clearFindProjectRootCache() {
  for (const searcher of searchers ?? []) {
    searcher.clearCache();
  }
}

export { clearFindProjectRootCache, findProjectRoot };
