"use strict";

const fs = require("fs");
const generateSync = require("gensync");

const readFile = generateSync({
  async: fs.promises.readFile,
  sync: fs.readFileSync,
});

const getFileContentOrNull = generateSync(
  /**
   * @param {string} filename
   * @returns {null | string}
   */
  function* (filename) {
    try {
      return yield* readFile(filename, "utf8");
    } catch (error) {
      return handleError(filename, error);
    }
  }
);

function handleError(filename, error) {
  if (error && error.code === "ENOENT") {
    return null;
  }

  throw new Error(`Unable to read ${filename}: ${error.message}`);
}

module.exports = getFileContentOrNull;
