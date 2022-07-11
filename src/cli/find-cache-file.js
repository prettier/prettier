import os from "node:os";
import path from "node:path";
import findCacheDir from "find-cache-dir";

/**
 * Find default cache file (`./node_modules/.cache/prettier/.prettier-cache`) using https://github.com/avajs/find-cache-dir
 *
 * @returns {string}
 */
function findCacheFile() {
  const cacheDir =
    findCacheDir({ name: "prettier", create: true }) || os.tmpdir();
  const cacheFilePath = path.join(cacheDir, ".prettier-cache");
  return cacheFilePath;
}

export default findCacheFile;
