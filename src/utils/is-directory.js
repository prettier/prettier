import fs from "node:fs/promises";
import { toPath } from "url-or-path";

/**
 * @param {string | URL} directory
 * @param {{allowSymlinks: boolean}} [options]
 * @returns {Promise<boolean>}
 */
async function isDirectory(directory, options) {
  const allowSymlinks = options?.allowSymlinks ?? true;

  let stats;
  try {
    stats = await (allowSymlinks ? fs.stat : fs.lstat)(toPath(directory));
  } catch {
    return false;
  }

  return stats.isDirectory();
}

export default isDirectory;
