"use strict";

const path = require("path");
const ignore = require("ignore").default;
const getFileContentOrNull = require("../utils/get-file-content-or-null.js");
const getKeyContentOrNull = require("./get-key-content-or-null.js");

/**
 * @param {string} filePath
 * @param {string?} ignorePath
 * @param {boolean?} withNodeModules
 */
async function createIgnorer(filePath, ignorePath, withNodeModules) {
  // prettier-ignore
  const ignoreContent = ignorePath &&
    await getFileContentOrNull(path.resolve(ignorePath)) ||
    await getKeyContentOrNull(path.dirname(filePath), "prettierIgnore");

  return _createIgnorer(ignoreContent, withNodeModules);
}

/**
 * @param {string} filePath
 * @param {string?} ignorePath
 * @param {boolean?} withNodeModules
 */
createIgnorer.sync = function (filePath, ignorePath, withNodeModules) {
  // prettier-ignore
  const ignoreContent = ignorePath &&
    getFileContentOrNull.sync(path.resolve(ignorePath)) ||
    getKeyContentOrNull.sync(path.dirname(filePath), "prettierIgnore");

  return _createIgnorer(ignoreContent, withNodeModules);
};

/**
 * @param {null | string | readonly string[]} ignoreContent
 * @param {boolean?} withNodeModules
 */
function _createIgnorer(ignoreContent, withNodeModules) {
  const ignorer = ignore({ allowRelativePaths: true }).add(ignoreContent || "");
  if (!withNodeModules) {
    ignorer.add("node_modules");
  }
  return ignorer;
}

module.exports = createIgnorer;
