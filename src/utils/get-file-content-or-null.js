import {promises as fsPromises} from "node:fs";

/**
 * @param {string} filename
 * @returns {Promise<null | string>}
 */
async function getFileContentOrNull(filename) {
  try {
    return await fsPromises.readFile(filename, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return null;
    }

    throw new Error(`Unable to read ${filename}: ${error.message}`);
  }
}

export default getFileContentOrNull;
