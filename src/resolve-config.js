"use strict";

const cosmiconfig = require("cosmiconfig");
const minimatch = require("minimatch");
const path = require("path");

const withCache = cosmiconfig("prettier");
const noCache = cosmiconfig("prettier", { cache: false });

function resolveConfig(filePath, opts) {
  if (opts && opts.configFile === false) {
    // do not look for a config file
    return Promise.resolve(null);
  }

  const useCache = !(opts && opts.useCache === false);
  const fileDir = filePath ? path.dirname(filePath) : undefined;

  return (
    (useCache ? withCache : noCache)
      // https://github.com/davidtheclark/cosmiconfig/pull/68
      .load(fileDir, opts && opts.configFile)
      .then(result => {
        if (!result) {
          return null;
        }

        return mergeOverrides(result.config, filePath);
      })
  );
}

function clearCache() {
  withCache.clearCaches();
}

function resolveConfigFile(filePath) {
  return noCache.load(filePath).then(result => {
    if (result) {
      return result.filepath;
    }
    return null;
  });
}

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
