import fs from "node:fs/promises";
import { toPath } from "url-or-path";

/**
 * @param {string | URL} file
 * @param {{allowSymlinks: boolean}} [options]
 * @returns {Promise<boolean>}
 */
async function isFile(file, options) {
  const allowSymlinks = options?.allowSymlinks ?? true;

  let stats;
  try {
    stats = await (allowSymlinks ? fs.stat : fs.lstat)(toPath(file));
  } catch {
    return false;
  }

  return stats.isFile();
}

export default isFile;
