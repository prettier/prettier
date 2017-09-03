"use strict";

const cosmiconfig = require("cosmiconfig");
const editorconfig = require("editorconfig");
const minimatch = require("minimatch");

const asyncWithCache = cosmiconfig("prettier");
const asyncNoCache = cosmiconfig("prettier", { cache: false });
const syncWithCache = cosmiconfig("prettier", { sync: true });
const syncNoCache = cosmiconfig("prettier", { cache: false, sync: true });

function editorConfigToPrettier(filePath) {
  const editorConfig = editorconfig.parseSync(filePath);
  const result = {};
  result.useTabs = editorConfig.indent_style === "tab" || result.useTabs;
  result.tabWidth = editorConfig.tab_width || result.tabWidth;
  result.printWidth = editorConfig.max_line_length || result.printWidth;
  return result;
}

function resolveConfig(filePath, opts) {
  const useCache = !(opts && opts.useCache === false);
  return (useCache ? asyncWithCache : asyncNoCache)
    .load(filePath)
    .then(result => {
      if (!result) {
        return null;
      }

      return Object.assign(
        {},
        editorConfigToPrettier(filePath),
        mergeOverrides(result.config, filePath)
      );
    });
}

resolveConfig.sync = (filePath, opts) => {
  const useCache = !(opts && opts.useCache === false);
  const result = (useCache ? syncWithCache : syncNoCache).load(filePath);

  if (!result) {
    return null;
  }

  return Object.assign(
    {},
    editorConfigToPrettier(filePath),
    mergeOverrides(result.config, filePath)
  );
};

function clearCache() {
  syncWithCache.clearCaches();
  asyncWithCache.clearCaches();
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
