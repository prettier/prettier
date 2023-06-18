"use strict";

const path = require("path");
const ignore = require("ignore").default;
const getFileContentOrNull = require("../utils/get-file-content-or-null.js");

/**
 * @param {string?} ignorePath
 * @param {boolean?} withNodeModules
 */
async function createIgnorer(ignorePath, withNodeModules) {
  let keyContent = "";

  try {
    keyContent = JSON.parse(
      await getFileContentOrNull(path.resolve("package.json"))
    ).prettierIgnore;
  } catch {
    keyContent = null;
  }

  const ignoreContent = ignorePath
    ? await getFileContentOrNull(path.resolve(ignorePath))
    : null;

  return _createIgnorer(ignoreContent, keyContent, withNodeModules);
}

/**
 * @param {string?} ignorePath
 * @param {boolean?} withNodeModules
 */
createIgnorer.sync = function (ignorePath, withNodeModules) {
  let keyContent = "";

  try {
    keyContent = JSON.parse(
      getFileContentOrNull.sync(path.resolve("package.json"))
    ).prettierIgnore;
  } catch {
    keyContent = null;
  }

  const ignoreContent = !ignorePath
    ? null
    : getFileContentOrNull.sync(path.resolve(ignorePath));

  return _createIgnorer(ignoreContent, keyContent, withNodeModules);
};

/**
 * @param {null | string} ignoreContent
 * @param {null | string} keyContent
 * @param {boolean?} withNodeModules
 */
function _createIgnorer(ignoreContent, keyContent, withNodeModules) {
  const ignorer = ignore({ allowRelativePaths: true })
    .add(ignoreContent || "")
    .add(keyContent || "");
  if (!withNodeModules) {
    ignorer.add("node_modules");
  }
  return ignorer;
}

module.exports = createIgnorer;
