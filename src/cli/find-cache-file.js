"use strict";

const { promises: fs } = require("fs");
const os = require("os");
const path = require("path");
const findCacheDir = require("find-cache-dir");
const { createHash } = require("./utils.js");

/**
 * Find default cache file (`./node_modules/.cache/prettier/.prettiercache`) using https://github.com/avajs/find-cache-dir
 */
function findDefaultCacheFile() {
  const cacheDir =
    findCacheDir({ name: "prettier", create: true }) || os.tmpdir();
  const cacheFilePath = path.join(cacheDir, ".prettiercache");
  return cacheFilePath;
}

/**
 * Inspired by `getCacheFile` function from ESLint
 *   https://github.com/eslint/eslint/blob/c2d0a830754b6099a3325e6d3348c3ba983a677a/lib/cli-engine/cli-engine.js#L424-L485
 *
 * @param {string | undefined} cacheLocation
 * @returns {Promise<string>}
 */
async function findCacheFile(cacheLocation) {
  if (!cacheLocation) {
    return findDefaultCacheFile();
  }
  const cwd = process.cwd();
  const normalizedCacheLocation = path.normalize(cacheLocation);
  const looksLikeADirectory = normalizedCacheLocation.slice(-1) === path.sep;
  const resolvedCacheLocation = path.resolve(cwd, normalizedCacheLocation);
  const getCacheFileForDirectory = () =>
    path.join(resolvedCacheLocation, `.cache_${createHash(cwd)}`);
  let fileStats;
  try {
    fileStats = await fs.lstat(resolvedCacheLocation);
  } catch {
    fileStats = null;
  }
  if (fileStats) {
    if (fileStats.isDirectory() || looksLikeADirectory) {
      return getCacheFileForDirectory();
    }
    return resolvedCacheLocation;
  }
  if (looksLikeADirectory) {
    return getCacheFileForDirectory();
  }
  return resolvedCacheLocation;
}

module.exports = findCacheFile;
