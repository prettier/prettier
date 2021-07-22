"use strict";

const path = require("path");
const editorconfig = require("editorconfig");
const editorConfigToPrettier = require("editorconfig-to-prettier");
const findProjectRoot = require("./find-project-root.js");

const syncConfigCache = new Map();
const asyncConfigCache = new Map();

const maybeParse = (filePath, parse) =>
  filePath &&
  parse(filePath, {
    root: findProjectRoot(path.dirname(path.resolve(filePath))),
  });

const editorconfigAsyncNoCache = async (filePath) =>
  editorConfigToPrettier(await maybeParse(filePath, editorconfig.parse));
const editorconfigAsyncWithCache = (filePath) => {
  const result =
    asyncConfigCache.get(filePath) ?? editorconfigAsyncNoCache(filePath);
  asyncConfigCache.set(filePath, result);
  return result;
};

const editorconfigSyncNoCache = (filePath) =>
  editorConfigToPrettier(maybeParse(filePath, editorconfig.parseSync));
const editorconfigSyncWithCache = (filePath) => {
  const result =
    syncConfigCache.get(filePath) ?? editorconfigSyncNoCache(filePath);
  syncConfigCache.set(filePath, result);
  return result;
};

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
  asyncConfigCache.clear();
  syncConfigCache.clear();
}

module.exports = {
  getLoadFunction,
  clearCache,
};
