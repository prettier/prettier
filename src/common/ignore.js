"use strict";

const fs = require("fs");
const ignore = require("ignore");
const path = require("path");

/**
 * Create the ignorer instance that can be used later to determine if
 * a given file path is ignored or not.
 *
 * @param {string} ignorePath The ignore path to use to create the ignorer.
 * @param {(error, resolvedIgnorePath) => void} errorHandler An error handler function that will be called when
 * an error occurred while reading one of the ignored path. The function will be called with the `error`
 * object as the first argument and the absolutely resolved `ignoredPath` as the second argument.
 *
 * @returns An `Ignore` object that can later be used to determine if a path should be ignored of not.
 */
function createIgnorer(ignorePath, errorHandler) {
  const resolvedIgnorePath = path.resolve(ignorePath);
  let ignoreText = "";

  try {
    ignoreText = fs.readFileSync(resolvedIgnorePath, "utf8");
  } catch (readError) {
    if (readError.code !== "ENOENT") {
      errorHandler(readError, resolvedIgnorePath);
    }
  }

  return ignore().add(ignoreText);
}

module.exports = {
  createIgnorer
};
