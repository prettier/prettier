"use strict";

const cosmiconfig = require("cosmiconfig");
const editorconfig = require("editorconfig");
const mem = require("mem");
const minimatch = require("minimatch");

const asyncWithCache = cosmiconfig("prettier");
const asyncNoCache = cosmiconfig("prettier", { cache: false });
const syncWithCache = cosmiconfig("prettier", { sync: true });
const syncNoCache = cosmiconfig("prettier", { cache: false, sync: true });

const editorconfigAsyncNoCache = (filePath, opts) =>
  filePath &&
  !opts.config &&
  editorconfig.parse(filePath).then(editorConfigToPrettier);
const editorconfigAsyncWithCache = mem(editorconfigAsyncNoCache);
const editorconfigSyncNoCache = (filePath, opts) =>
  filePath &&
  !opts.config &&
  editorConfigToPrettier(editorconfig.parseSync(filePath));
const editorconfigSyncWithCache = mem(editorconfigSyncNoCache);

function editorConfigToPrettier(editorConfig) {
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

function resolveConfig(filePath, opts) {
  opts = opts || {};
  const useCache = !(opts && opts.useCache === false);
  return Promise.all([
    (useCache ? asyncWithCache : asyncNoCache).load(filePath),
    (useCache ? editorconfigAsyncWithCache : editorconfigAsyncNoCache)(
      filePath,
      opts
    )
  ]).then(arr => {
    const result = arr[0];
    const editorConfigged = arr[1];
    return mergeEditorConfig(filePath, result, editorConfigged);
  });
}

resolveConfig.sync = (filePath, opts) => {
  opts = opts || {};
  const useCache = !(opts && opts.useCache === false);
  const result = (useCache ? syncWithCache : syncNoCache).load(filePath);
  const editorConfigged = (useCache
    ? editorconfigSyncWithCache
    : editorconfigSyncNoCache)(filePath, opts);
  return mergeEditorConfig(filePath, result, editorConfigged);
};

function mergeEditorConfig(filePath, result, editorConfigged) {
  if (!filePath) {
    return null;
  }

  const config = result && result.config;

  return Object.assign({}, editorConfigged, mergeOverrides(config, filePath));
}

function clearCache() {
  syncWithCache.clearCaches();
  asyncWithCache.clearCaches();

  mem.clear(editorconfigSyncWithCache);
  mem.clear(editorconfigAsyncWithCache);
}

function resolveConfigFile(filePath) {
  return asyncNoCache.load(filePath).then(result => {
    return result ? result.filepath : null;
  });
}

resolveConfigFile.sync = filePath => {
  const result = syncNoCache.load(filePath);
  return result ? result.filepath : null;
};

function mergeOverrides(config, filePath) {
  const options = Object.assign({}, config);
  if (filePath && options.overrides) {
    for (const override of options.overrides) {
      if (pathMatchesGlobs(filePath, override.files, override.excludeFiles)) {
        Object.assign(options, override.options);
      }
    }
  }

  delete options.overrides;
  return options;
}

// Based on eslint: https://github.com/eslint/eslint/blob/master/lib/config/config-ops.js
function pathMatchesGlobs(filePath, patterns, excludedPatterns) {
  const patternList = [].concat(patterns);
  const excludedPatternList = [].concat(excludedPatterns || []);
  const opts = { matchBase: true };

  return (
    patternList.some(pattern => minimatch(filePath, pattern, opts)) &&
    !excludedPatternList.some(excludedPattern =>
      minimatch(filePath, excludedPattern, opts)
    )
  );
}

module.exports = {
  resolveConfig,
  resolveConfigFile,
  clearCache
};
