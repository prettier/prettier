"use strict";

const path = require("path");

const editorconfig = require("editorconfig");
const memoize = require("nano-memoize");
const editorConfigToPrettier = require("editorconfig-to-prettier");
const findProjectRoot = require("./find-project-root");

const maybeParse = (filePath, parse) =>
  filePath &&
  parse(filePath, {
    root: findProjectRoot(path.dirname(path.resolve(filePath))),
  });

const editorconfigAsyncNoCache = async (filePath) =>
  editorConfigToPrettier(await maybeParse(filePath, editorconfig.parse));
const editorconfigAsyncWithCache = memoize(editorconfigAsyncNoCache);

const editorconfigSyncNoCache = (filePath) =>
  editorConfigToPrettier(maybeParse(filePath, editorconfig.parseSync));
const editorconfigSyncWithCache = memoize(editorconfigSyncNoCache);

function getLoadFunction(opts) {
  if (!opts.editorconfig) {
    return () => null;
  }

  if (opts.sync) {
    return opts.cache ? editorconfigSyncWithCache : editorconfigSyncNoCache;
  }

  return opts.cache ? editorconfigAsyncWithCache : editorconfigAsyncNoCache;
}

function clearCache() {
  editorconfigSyncWithCache.clear();
  editorconfigAsyncWithCache.clear();
}

module.exports = {
  getLoadFunction,
  clearCache,
};
