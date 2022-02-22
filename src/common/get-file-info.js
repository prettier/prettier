"use strict";

const path = require("path");
const gensync = require("gensync");
const options = require("../main/options.js");
const config = require("../config/resolve-config.js");
const createIgnorer = require("./create-ignorer.js");

/**
 * @typedef {{ ignorePath?: string, withNodeModules?: boolean, plugins: object }} FileInfoOptions
 * @typedef {{ ignored: boolean, inferredParser: string | null }} FileInfoResult
 */

const { async: getFileInfo, sync: getFileInfoSync } = gensync(
  /**
   * @param {string} filePath
   * @param {FileInfoOptions} opts
   * @returns {FileInfoResult}
   *
   * Please note that prettier.getFileInfo() expects opts.plugins to be an array of paths,
   * not an object. A transformation from this array to an object is automatically done
   * internally by the method wrapper. See withPlugins() in index.js.
   */
  function* getFileInfo(filePath, opts) {
    if (typeof filePath !== "string") {
      throw new TypeError(
        `expect \`filePath\` to be a string, got \`${typeof filePath}\``
      );
    }

    const ignorer = yield* createIgnorer(opts.ignorePath, opts.withNodeModules);
    return _getFileInfo({
      ignorer,
      filePath,
      plugins: opts.plugins,
      resolveConfig: opts.resolveConfig,
      ignorePath: opts.ignorePath,
      sync: false,
    });
  }
);

/**
 * @param {string} filePath
 * @param {FileInfoOptions} opts
 * @returns {FileInfoResult}
 */
getFileInfo.sync = getFileInfoSync;

function getFileParser(resolvedConfig, filePath, plugins) {
  if (resolvedConfig && resolvedConfig.parser) {
    return resolvedConfig.parser;
  }

  const inferredParser = options.inferParser(filePath, plugins);

  if (inferredParser) {
    return inferredParser;
  }

  return null;
}

function _getFileInfo({
  ignorer,
  filePath,
  plugins,
  resolveConfig = false,
  ignorePath,
  sync = false,
}) {
  const normalizedFilePath = normalizeFilePath(filePath, ignorePath);

  const fileInfo = {
    ignored: ignorer.ignores(normalizedFilePath),
    inferredParser: null,
  };

  if (fileInfo.ignored) {
    return fileInfo;
  }

  let resolvedConfig;

  if (resolveConfig) {
    if (sync) {
      resolvedConfig = config.resolveConfig.sync(filePath);
    } else {
      return config.resolveConfig(filePath).then((resolvedConfig) => {
        fileInfo.inferredParser = getFileParser(
          resolvedConfig,
          filePath,
          plugins
        );
        return fileInfo;
      });
    }
  }

  fileInfo.inferredParser = getFileParser(resolvedConfig, filePath, plugins);
  return fileInfo;
}

function normalizeFilePath(filePath, ignorePath) {
  return ignorePath
    ? path.relative(path.dirname(ignorePath), filePath)
    : filePath;
}

module.exports = getFileInfo;
