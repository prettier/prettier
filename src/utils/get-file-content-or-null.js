import fs from "node:fs";
const fsAsync = fs.promises;

/**
 * @param {string} filename
 * @returns {Promise<null | string>}
 */
async function getFileContentOrNull(filename) {
  try {
    return await fsAsync.readFile(filename, "utf8");
  } catch (error) {
    return handleError(filename, error);
  }
}

/**
 * @param {string} filename
 * @returns {null | string}
 */
getFileContentOrNull.sync = function (filename) {
  try {
    return fs.readFileSync(filename, "utf8");
  } catch (error) {
    return handleError(filename, error);
  }
};

function handleError(filename, error) {
  if (error && error.code === "ENOENT") {
    return null;
  }

  throw new Error(`Unable to read ${filename}: ${error.message}`);
}

export default getFileContentOrNull;
