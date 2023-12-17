// Simple version of `find-project-root`
// https://github.com/kirstein/find-project-root/blob/master/index.js

import path from "node:path";

import iterateDirectoryUp from "iterate-directory-up";

import isDirectory from "../utils/is-directory.js";

const MARKERS = [".git", ".hg"];

/**
 * Find the directory contains a version control system directory
 * @param {string} startDirectory
 * @returns {Promise<string | undefined>}
 */
async function findProjectRoot(startDirectory) {
  for (const directory of iterateDirectoryUp(startDirectory)) {
    for (const name of MARKERS) {
      const directoryPath = path.join(directory, name);

      if (await isDirectory(directoryPath, { allowSymlinks: false })) {
        return directory;
      }
    }
  }
}

export default findProjectRoot;
