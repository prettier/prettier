"use strict";

const ignoreDeprecated = require("ignore-deprecated");
const path = require("path");
const getFileContentOrNull = require("../utils/get-file-content-or-null");
const RecursiveIgnorer = require("../utils/recursive-ignorer");

/**
 * @param {undefined | string} ignorePath
 * @param {undefined | boolean} withNodeModules
 */
async function createIgnorer(ignorePath, withNodeModules) {
  if (!ignorePath) {
    return new RecursiveIgnorer(withNodeModules);
  }
  const ignoreContent = await getFileContentOrNull(path.resolve(ignorePath));
  return _createIgnorer(ignoreContent, withNodeModules);
}

/**
 * @param {undefined | string} ignorePath
 * @param {undefined | boolean} withNodeModules
 */
createIgnorer.sync = function(ignorePath, withNodeModules) {
  if (!ignorePath) {
    return new RecursiveIgnorer(withNodeModules);
  }
  const ignoreContent = getFileContentOrNull.sync(path.resolve(ignorePath));
  return _createIgnorer(ignoreContent, withNodeModules);
};

/**
 * @param {null | string} ignoreContent
 * @param {undefined | boolean} withNodeModules
 */
function _createIgnorer(ignoreContent, withNodeModules) {
  const ignorer = ignoreDeprecated().add(ignoreContent || "");
  if (!withNodeModules) {
    ignorer.add("node_modules");
  }
  return ignorer;
}

module.exports = createIgnorer;
