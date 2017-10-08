"use strict";

const cosmiconfig = require("cosmiconfig");
const editorconfig = require("editorconfig");
const minimatch = require("minimatch");
const mem = require("mem");

const getExplorerMemoized = mem(opts =>
  cosmiconfig("prettier", {
    sync: opts.sync,
    cache: opts.cache,
    rcExtensions: true
  })
);

/** @param {{ cache: boolean, sync: boolean }} opts */
function getLoadFunction(opts) {
  // Normalize opts before passing to a memoized function
  opts = Object.assign({ sync: false, cache: false }, opts);
  return getExplorerMemoized(opts).load;
}

const editorconfigAsyncNoCache = (filePath, config) =>
  Promise.resolve(
    filePath &&
      !config &&
      editorconfig.parse(filePath).then(editorConfigToPrettier)
  );
const editorconfigAsyncWithCache = mem(editorconfigAsyncNoCache);
const editorconfigSyncNoCache = (filePath, config) =>
  filePath &&
  !config &&
  editorConfigToPrettier(editorconfig.parseSync(filePath));
const editorconfigSyncWithCache = mem(editorconfigSyncNoCache);

function getLoadEditorConfigFunction(opts) {
  if (opts.sync) {
    return opts.cache ? editorconfigSyncWithCache : editorconfigSyncNoCache;
  }

  return opts.cache ? editorconfigAsyncWithCache : editorconfigAsyncNoCache;
}

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
  opts = Object.assign({ useCache: true }, opts);
  const loadOpts = { cache: !!opts.useCache, sync: false };
  const load = getLoadFunction(loadOpts);
  const loadEditorConfig = getLoadEditorConfigFunction(loadOpts);
  return Promise.all([
    load(filePath, opts.config),
    loadEditorConfig(filePath, opts.config)
  ]).then(arr => {
    const result = arr[0];
    const editorConfigged = arr[1];
    return mergeEditorConfig(filePath, result, editorConfigged);
  });
}

resolveConfig.sync = (filePath, opts) => {
  opts = Object.assign({ useCache: true }, opts);
  const loadOpts = { cache: !!opts.useCache, sync: true };
  const load = getLoadFunction(loadOpts);
  const loadEditorConfig = getLoadEditorConfigFunction(loadOpts);
  const result = load(filePath, opts.config);
  const editorConfigged = loadEditorConfig(filePath, opts.config);
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
  mem.clear(getExplorerMemoized);
  mem.clear(editorconfigSyncWithCache);
  mem.clear(editorconfigAsyncWithCache);
}

function resolveConfigFile(filePath) {
  const load = getLoadFunction({ sync: false });
  return load(filePath).then(result => {
    return result ? result.filepath : null;
  });
}

resolveConfigFile.sync = filePath => {
  const load = getLoadFunction({ sync: true });
  const result = load(filePath);
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
