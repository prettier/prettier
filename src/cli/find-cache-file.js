import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import findCacheDir from "find-cache-dir";
import { isJson, statSafe } from "./utils.js";

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
  const cacheFile = path.resolve(cacheLocation);

  const stat = await statSafe(cacheFile);
  if (stat) {
    if (stat.isDirectory()) {
      throw new Error(
        `Resolved --cache-location '${cacheFile}' is a directory`,
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

export default findCacheFile;
