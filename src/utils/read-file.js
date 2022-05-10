import { promises as fsPromises } from "node:fs";

/**
 * @param {string} filename
 * @returns {Promise<undefined | string>}
 */
async function readFile(filename) {
  try {
    return await fsPromises.readFile(filename, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return;
    }

    throw new Error(`Unable to read ${filename}: ${error.message}`);
  }
}

export default readFile;
