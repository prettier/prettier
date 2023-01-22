"use strict";

const path = require("path");
const ignore = require("ignore").default;
const getFileContentOrNull = require("../utils/get-file-content-or-null.js");

/**
 * @param {string?} ignorePath
 * @param {boolean?} withNodeModules
 * @param {Array<string>?} ignorePatterns
 */
async function createIgnorer(ignorePath, withNodeModules, ignorePatterns = []) {
  const ignoreContent = ignorePath
    ? await getFileContentOrNull(path.resolve(ignorePath))
    : null;

  return _createIgnorer(ignoreContent, withNodeModules, ignorePatterns);
}

/**
 * @param {string?} ignorePath
 * @param {boolean?} withNodeModules
 */
createIgnorer.sync = function (
  ignorePath,
  withNodeModules,
  ignorePatterns = []
) {
  const ignoreContent = !ignorePath
    ? null
    : getFileContentOrNull.sync(path.resolve(ignorePath));
  return _createIgnorer(ignoreContent, withNodeModules, ignorePatterns);
};

/**
 * @param {null | string} ignoreContent
 * @param {boolean?} withNodeModules
 * @param {Array<string>} ignorePatterns
 */
function _createIgnorer(ignoreContent, withNodeModules, ignorePatterns) {
  const ignorer = ignore({ allowRelativePaths: true }).add(ignoreContent || "");
  ignorer.add(ignorePatterns);

  if (!withNodeModules) {
    ignorer.add("node_modules");
  }
  return ignorer;
}

module.exports = createIgnorer;
