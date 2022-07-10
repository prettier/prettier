"use strict";

const os = require("os");
const path = require("path");
const findCacheDir = require("find-cache-dir");
const { statSafe } = require("./utils.js");

/**
 * Find default cache file (`./node_modules/.cache/prettier/.prettier-cache`) using https://github.com/avajs/find-cache-dir
 */
function findDefaultCacheFile() {
  const cacheDir =
    findCacheDir({ name: "prettier", create: true }) || os.tmpdir();
  const cacheFilePath = path.join(cacheDir, ".prettier-cache");
  return cacheFilePath;
}

async function findCacheFileFromOption(cacheLocation) {
  const cwd = process.cwd();
  const normalized = path.normalize(cacheLocation);
  const cacheFile = path.join(cwd, normalized);

  const stat = await statSafe(cacheFile);
  if (stat && stat.isDirectory()) {
    throw new Error(`Resolved --cache-location '${cacheFile}' is a directory`);
  }
  return cacheFile;
}

/**
 * @param {string | undefined} cacheLocation
 * @returns {Promise<string>}
 */
async function findCacheFile(cacheLocation) {
  if (!cacheLocation) {
    return findDefaultCacheFile();
  }
  const cacheFile = await findCacheFileFromOption(cacheLocation);
  return cacheFile;
}

module.exports = findCacheFile;
