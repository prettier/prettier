import fs from "node:fs/promises";
import { isUrlString } from "url-or-path";

/**
 * @param {string | URL} file
 * @returns {Promise<undefined | string>}
 */
async function readFile(file) {
  if (isUrlString(file)) {
    file = new URL(file);
  }

  try {
    return await fs.readFile(file, "utf8");
  } catch (/** @type {any} */ error) {
    if (error.code === "ENOENT") {
      return;
    }

    throw new Error(`Unable to read '${file}': ${error.message}`);
  }
}

export default readFile;
