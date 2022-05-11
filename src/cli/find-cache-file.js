"use strict";

const os = require("os");
const path = require("path");
const findCacheDir = require("find-cache-dir");

/**
 * Find default cache file (`./node_modules/.cache/prettier/.prettier-cache`) using https://github.com/avajs/find-cache-dir
 */
function findDefaultCacheFile() {
  const cacheDir =
    findCacheDir({ name: "prettier", create: true }) || os.tmpdir();
  const cacheFilePath = path.join(cacheDir, ".prettier-cache");
  return cacheFilePath;
}

/**
 * @returns {string}
 */
function findCacheFile() {
  return findDefaultCacheFile();
}

module.exports = findCacheFile;
