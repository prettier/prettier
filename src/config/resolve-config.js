"use strict";

const thirdParty = require("../common/third-party");
const minimatch = require("minimatch");
const resolve = require("resolve");
const path = require("path");
const mem = require("mem");

const resolveEditorConfig = require("./resolve-config-editorconfig");
const loadToml = require("../utils/load-toml");

const requireModule = eval("require");

const getExplorerMemoized = mem(
  opts => {
    const cosmiconfig = thirdParty["cosmiconfig" + (opts.sync ? "Sync" : "")];
    const explorer = cosmiconfig("prettier", {
      cache: opts.cache,
      transform: result => {
        if (result && result.config) {
          if (typeof result.config === "string") {
            const modulePath = resolve.sync(result.config, {
              basedir: path.dirname(result.filepath)
            });
            result.config = requireModule(modulePath);
          }

          if (typeof result.config !== "object") {
            throw new Error(
              "Config is only allowed to be an object, " +
                `but received ${typeof result.config} in "${result.filepath}"`
            );
          }

          delete result.config.$schema;
        }
        return result;
      },
      searchPlaces: [
        "package.json",
        ".prettierrc",
        ".prettierrc.json",
        ".prettierrc.yaml",
        ".prettierrc.yml",
        ".prettierrc.js",
        "prettier.config.js",
        ".prettierrc.toml"
      ],
      loaders: {
        ".toml": loadToml
      }
    });

    return {
      // cosmiconfig v4 interface
      load: (searchPath, configPath) =>
        configPath ? explorer.load(configPath) : explorer.search(searchPath)
    };
  },
  { cacheKey: JSON.stringify }
);

/** @param {{ cache: boolean, sync: boolean }} opts */
function getLoadFunction(opts) {
  // Normalize opts before passing to a memoized function
  opts = { sync: false, cache: false, ...opts };
  return getExplorerMemoized(opts).load;
}

function _resolveConfig(filePath, opts, sync) {
  opts = { useCache: true, ...opts };
  const loadOpts = {
    cache: !!opts.useCache,
    sync: !!sync,
    editorconfig: !!opts.editorconfig
  };
  const load = getLoadFunction(loadOpts);
  const loadEditorConfig = resolveEditorConfig.getLoadFunction(loadOpts);
  const arr = [load, loadEditorConfig].map(l => l(filePath, opts.config));

  const unwrapAndMerge = ([result, editorConfigured]) => {
    const merged = {
      ...editorConfigured,
      ...mergeOverrides(result, filePath)
    };

    ["plugins", "pluginSearchDirs"].forEach(optionName => {
      if (Array.isArray(merged[optionName])) {
        merged[optionName] = merged[optionName].map(value =>
          typeof value === "string" && value.startsWith(".") // relative path
            ? path.resolve(path.dirname(result.filepath), value)
            : value
        );
      }
    });

    if (!result && !editorConfigured) {
      return null;
    }

    return merged;
  };

  if (loadOpts.sync) {
    return unwrapAndMerge(arr);
  }

  return Promise.all(arr).then(unwrapAndMerge);
}

const resolveConfig = (filePath, opts) => _resolveConfig(filePath, opts, false);

resolveConfig.sync = (filePath, opts) => _resolveConfig(filePath, opts, true);

function clearCache() {
  mem.clear(getExplorerMemoized);
  resolveEditorConfig.clearCache();
}

async function resolveConfigFile(filePath) {
  const load = getLoadFunction({ sync: false });
  const result = await load(filePath);
  return result ? result.filepath : null;
}

resolveConfigFile.sync = filePath => {
  const load = getLoadFunction({ sync: true });
  const result = load(filePath);
  return result ? result.filepath : null;
};

function mergeOverrides(configResult, filePath) {
  const { config, filepath: configPath } = configResult || {};
  const { overrides, ...options } = config || {};
  if (filePath && overrides) {
    const relativeFilePath = path.relative(path.dirname(configPath), filePath);
    for (const override of overrides) {
      if (
        pathMatchesGlobs(
          relativeFilePath,
          override.files,
          override.excludeFiles
        )
      ) {
        Object.assign(options, override.options);
      }
    }
  }

  return options;
}

// Based on eslint: https://github.com/eslint/eslint/blob/master/lib/config/config-ops.js
function pathMatchesGlobs(filePath, patterns, excludedPatterns) {
  const patternList = [].concat(patterns);
  const excludedPatternList = [].concat(excludedPatterns || []);
  const opts = { matchBase: true, dot: true };

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
