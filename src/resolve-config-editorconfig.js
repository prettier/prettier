"use strict";

const path = require("path");

const editorconfig = require("editorconfig");
const mem = require("mem");
const editorConfigToPrettier = require("editorconfig-to-prettier");
const findProjectRoot = require("find-project-root");

const maybeParse = (filePath, config, parse) => {
  const root = findProjectRoot(path.dirname(path.resolve(filePath)));
  return filePath && !config && parse(filePath, { root });
};

const editorconfigAsyncNoCache = (filePath, config) => {
  return Promise.resolve(maybeParse(filePath, config, editorconfig.parse)).then(
    editorConfigToPrettier
  );
};
const editorconfigAsyncWithCache = mem(editorconfigAsyncNoCache);

const editorconfigSyncNoCache = (filePath, config) => {
  return editorConfigToPrettier(
    maybeParse(filePath, config, editorconfig.parseSync)
  );
};
const editorconfigSyncWithCache = mem(editorconfigSyncNoCache);

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
  mem.clear(editorconfigSyncWithCache);
  mem.clear(editorconfigAsyncWithCache);
}

module.exports = {
  getLoadFunction,
  clearCache
};
