"use strict";

const createIgnorer = require("./create-ignorer");
const options = require("../main/options");

/**
 * @param {string} filePath
 * @param {{ ignorePath?: string, withNodeModules?: boolean, plugins: object }} opts
 *
 * Please note that prettier.getFileInfo() expects opts.plugins to be an array of paths,
 * not an object. A transformation from this array to an object is automatically done
 * internally by the method wrapper. See withPlugins() in index.js.
 */
function _getFileInfo(filePath, opts) {
  let ignored = false;
  const ignorer = createIgnorer(opts.ignorePath, opts.withNodeModules);
  ignored = ignorer.ignores(filePath);

  const inferredParser = options.inferParser(filePath, opts.plugins) || null;

  return {
    ignored,
    inferredParser
  };
}

// the method has been implemented as asynchronous to avoid possible breaking changes in future
function getFileInfo(filePath, opts) {
  return Promise.resolve().then(() => _getFileInfo(filePath, opts));
}

getFileInfo.sync = _getFileInfo;

module.exports = getFileInfo;
