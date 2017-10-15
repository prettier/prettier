"use strict";

const editorconfig = require("editorconfig");
const mem = require("mem");
const pathRoot = require("path-root");

const maybeParse = (filePath, config, parse) => {
  const root = filePath && pathRoot(filePath);
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
  if (opts.sync) {
    return opts.cache ? editorconfigSyncWithCache : editorconfigSyncNoCache;
  }

  return opts.cache ? editorconfigAsyncWithCache : editorconfigAsyncNoCache;
}

function clearCache() {
  mem.clear(editorconfigSyncWithCache);
  mem.clear(editorconfigAsyncWithCache);
}

function editorConfigToPrettier(editorConfig) {
  editorConfig = editorConfig || {};
  const result = {};

  if (editorConfig.indent_style) {
    result.useTabs = editorConfig.indent_style === "tab";
  }

  const tabWidth = editorConfig.indent_size || editorConfig.tab_width;
  if (tabWidth) {
    result.tabWidth = tabWidth;
  }

  if (editorConfig.max_line_length) {
    result.printWidth = editorConfig.max_line_length;
  }

  return result;
}

module.exports = {
  getLoadFunction,
  clearCache
};
