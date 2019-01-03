"use strict";

const createIgnorer = require("./create-ignorer");
const options = require("../main/options");
const path = require("path");

/**
 * @typedef {{ ignorePath?: string, withNodeModules?: boolean, plugins: object }} FileInfoOptions
 * @typedef {{ ignored: boolean, inferredParser: string | null }} FileInfoResult
 */

/**
 * @param {string} filePath
 * @param {FileInfoOptions} opts
 * @returns {Promise<FileInfoResult>}
 *
 * Please note that prettier.getFileInfo() expects opts.plugins to be an array of paths,
 * not an object. A transformation from this array to an object is automatically done
 * internally by the method wrapper. See withPlugins() in index.js.
 */
function getFileInfo(filePath, opts) {
  return createIgnorer(opts.ignorePath, opts.withNodeModules).then(ignorer =>
    _getFileInfo(
      ignorer,
      normalizeFilePath(filePath, opts.ignorePath),
      opts.plugins
    )
  );
}

/**
 * @param {string} filePath
 * @param {FileInfoOptions} opts
 * @returns {FileInfoResult}
 */
getFileInfo.sync = function(filePath, opts) {
  const ignorer = createIgnorer.sync(opts.ignorePath, opts.withNodeModules);
  return _getFileInfo(
    ignorer,
    normalizeFilePath(filePath, opts.ignorePath),
    opts.plugins
  );
};

function _getFileInfo(ignorer, filePath, plugins) {
  const ignored = ignorer.ignores(filePath);
  const inferredParser = options.inferParser(filePath, plugins) || null;

  return {
    ignored,
    inferredParser
  };
}

function normalizeFilePath(filePath, ignorePath) {
  return ignorePath
    ? path.relative(path.dirname(ignorePath), filePath)
    : filePath;
}

module.exports = getFileInfo;
