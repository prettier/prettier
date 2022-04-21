"use strict";

const path = require("path");
const ignore = require("ignore").default;
const getFileContentOrNull = require("../utils/get-file-content-or-null.js");

/**
 * @param {string?} ignorePath
 * @param {boolean?} withNodeModules
 */
async function createIgnorer(ignorePath, withNodeModules) {
  let ignoreContent = ignorePath
    ? await getFileContentOrNull(path.resolve(ignorePath))
    : null;

  if (!ignoreContent) {
    try {
      ignoreContent = JSON.parse(
        await getFileContentOrNull(path.resolve("package.json"))
      ).prettierIgnore;
    } catch {
      ignoreContent = null;
    }
  }

  return _createIgnorer(ignoreContent, withNodeModules);
}

/**
 * @param {string?} ignorePath
 * @param {boolean?} withNodeModules
 */
createIgnorer.sync = function (ignorePath, withNodeModules) {
  let ignoreContent = !ignorePath
    ? null
    : getFileContentOrNull.sync(path.resolve(ignorePath));

  if (!ignoreContent) {
    try {
      ignoreContent = JSON.parse(
        getFileContentOrNull.sync(path.resolve("package.json"))
      ).prettierIgnore;
    } catch {
      ignoreContent = null;
    }
  }

  return _createIgnorer(ignoreContent, withNodeModules);
};

/**
 * @param {null | string} ignoreContent
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
