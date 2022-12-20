"use strict";

const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { statSafe, isJson } = require("./utils.js");

/**
 * Find default cache directory
 *   `package.json` does not exist -> os.tmpdir()
 *   PnP v1 -> `.pnp/.cache/prettier`
 *   PnP v3 -> `.yarn/.cache/prettier`
 *   otherwise -> `./node_modules/.cache/prettier`
 * @returns {Promise<string>}
 */
async function findDefaultCacheDir() {
  const cacheDirName = "prettier";
  const cwd = process.cwd();
  let dir = cwd;
  for (;;) {
    try {
      if ((await statSafe(path.join(dir, "package.json"))).isFile()) {
        break;
      }
    } catch {
      // nothing
    }
    const parent = path.dirname(dir);
    if (dir === parent) {
      dir = undefined;
      break;
    }
    dir = parent;
  }
  if (!dir) {
    return os.tmpdir();
  }
  if (process.versions.pnp === "1") {
    return path.resolve(dir, `.pnp/.cache/${cacheDirName}`);
  }
  if (process.versions.pnp === "3") {
    return path.resolve(dir, `.yarn/.cache/${cacheDirName}`);
  }
  return path.resolve(dir, `node_modules/.cache/${cacheDirName}`);
}

/**
 * Find default cache file (`./node_modules/.cache/prettier/.prettier-cache`) using https://github.com/avajs/find-cache-dir
 */
async function findDefaultCacheFile() {
  return path.join(await findDefaultCacheDir(), ".prettier-cache");
}

async function findCacheFileFromOption(cacheLocation) {
  const cacheFile = path.resolve(cacheLocation);

  const stat = await statSafe(cacheFile);
  if (stat) {
    if (stat.isDirectory()) {
      throw new Error(
        `Resolved --cache-location '${cacheFile}' is a directory`
      );
    }

    const data = await fs.readFile(cacheFile, "utf8");
    if (!isJson(data)) {
      throw new Error(`'${cacheFile}' isn't a valid JSON file`);
    }
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
