"use strict";

const { promises: fs } = require("fs");
const os = require("os");
const path = require("path");
const findCacheDir = require("find-cache-dir");
const { createHash } = require("./utils.js");

function findDefaultCacheFile() {
  const cacheDir =
    findCacheDir({ name: "prettier", create: true }) || os.tmpdir();
  const cacheFilePath = path.join(cacheDir, ".prettier-cache");
  return cacheFilePath;
}

async function findCacheFileFromOption(cacheLocation) {
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

/**
 * Find default cache file (`./node_modules/.cache/prettier/.prettier-cache`) using https://github.com/avajs/find-cache-dir
 *
 * @param {string | undefined} cacheLocation
 * @returns {Promise<string>}
 */
async function findCacheFile(cacheLocation) {
  if (!cacheLocation) {
    return findDefaultCacheFile();
  }
  const cacheFilePath = await findCacheFileFromOption(cacheLocation);
  return cacheFilePath;
}

module.exports = findCacheFile;
