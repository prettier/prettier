"use strict";

const os = require("os");
const path = require("path");
const findCacheDir = require("find-cache-dir");

function findDefaultCacheFile() {
  const cacheDir =
    findCacheDir({ name: "prettier", create: true }) || os.tmpdir();
  const cacheFilePath = path.join(cacheDir, ".prettier-cache");
  return cacheFilePath;
}

/**
 * Find default cache file (`./node_modules/.cache/prettier/.prettier-cache`) using https://github.com/avajs/find-cache-dir
 *
 * @param {string | undefined} cacheLocation
 * @returns {string}
 */
function findCacheFile(cacheLocation) {
  if (!cacheLocation) {
    return findDefaultCacheFile();
  }
  const cwd = process.cwd();
  const normalized = path.normalize(cacheLocation);
  return path.join(cwd, normalized);
}

module.exports = findCacheFile;
