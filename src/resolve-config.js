"use strict";

const cosmiconfig = require("cosmiconfig");
const minimatch = require("minimatch");

let ranInit = false;
let asyncWithCache;
let asyncNoCache;
let syncWithCache;
let syncNoCache;

function ensureCosmiconfigInit() {
  if (ranInit) {
    return;
  }
  asyncWithCache = cosmiconfig("prettier");
  asyncNoCache = cosmiconfig("prettier", { cache: false });
  syncWithCache = cosmiconfig("prettier", { sync: true });
  syncNoCache = cosmiconfig("prettier", { cache: false, sync: true });
  ranInit = true;
}

function resolveConfig(filePath, opts) {
  ensureCosmiconfigInit();
  const useCache = !(opts && opts.useCache === false);
  return (useCache ? asyncWithCache : asyncNoCache)
    .load(filePath)
    .then(result => {
      return !result ? null : mergeOverrides(result.config, filePath);
    });
}

resolveConfig.sync = (filePath, opts) => {
  ensureCosmiconfigInit();
  const useCache = !(opts && opts.useCache === false);
  const result = (useCache ? syncWithCache : syncNoCache).load(filePath);
  return !result ? null : mergeOverrides(result.config, filePath);
};

function clearCache() {
  ensureCosmiconfigInit();
  syncWithCache.clearCaches();
  asyncWithCache.clearCaches();
}

function resolveConfigFile(filePath) {
  ensureCosmiconfigInit();
  return asyncNoCache.load(filePath).then(result => {
    return result ? result.filepath : null;
  });
}

resolveConfigFile.sync = filePath => {
  ensureCosmiconfigInit();
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
