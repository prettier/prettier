"use strict";

const path = require("path");
const ignore = require("ignore");
const gensync = require("gensync");
const getFileContentOrNull = require("../utils/get-file-content-or-null.js");

const { async: createIgnorer, sync: createIgnorerSync } = gensync(
  /**
   * @param {string?} ignorePath
   * @param {boolean?} withNodeModules
   */
  function* (ignorePath, withNodeModules) {
    const ignoreContent = ignorePath
      ? yield* getFileContentOrNull(path.resolve(ignorePath))
      : null;
    return _createIgnorer(ignoreContent, withNodeModules);
  }
);
createIgnorer.sync = createIgnorerSync;

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
