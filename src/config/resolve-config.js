"use strict";

const path = require("path");
const micromatch = require("micromatch");
const thirdParty = require("../common/third-party.js");

const loadToml = require("../utils/load-toml.js");
const loadJson5 = require("../utils/load-json5.js");
const partition = require("../utils/partition.js");
const resolve = require("../common/resolve.js");
const { default: mem, memClear } = require("../../vendors/mem.js");
const resolveEditorConfig = require("./resolve-config-editorconfig.js");

/**
 * @typedef {ReturnType<import("cosmiconfig").cosmiconfig>} Explorer
 * @typedef {ReturnType<import("cosmiconfig").cosmiconfigSync>} SyncExplorer
 * @typedef {{sync?: boolean; cache?: boolean }} Options
 */

/**
 * @template {Options} Opts
 * @param {Opts} opts
 * @return {Opts["sync"] extends true ? SyncExplorer : Explorer}
 */
const getExplorerMemoized = mem(
  (opts) => {
    const cosmiconfig = thirdParty["cosmiconfig" + (opts.sync ? "Sync" : "")];
    const explorer = cosmiconfig("prettier", {
      cache: opts.cache,
      transform: (result) => {
        if (result && result.config) {
          if (typeof result.config === "string") {
            const dir = path.dirname(result.filepath);
            const modulePath = resolve(result.config, { paths: [dir] });
            result.config = require(modulePath);
          }

          if (typeof result.config !== "object") {
            throw new TypeError(
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
        ".prettierrc.json5",
        ".prettierrc.js",
        ".prettierrc.cjs",
        "prettier.config.js",
        "prettier.config.cjs",
        ".prettierrc.toml",
      ],
      loaders: {
        ".toml": loadToml,
        ".json5": loadJson5,
      },
    });

    return explorer;
  },
  { cacheKey: JSON.stringify }
);

/**
 * @template {Options} Opts
 * @param {Opts} opts
 * @return {Opts["sync"] extends true ? SyncExplorer : Explorer}
 */
function getExplorer(opts) {
  // Normalize opts before passing to a memoized function
  opts = { sync: false, cache: false, ...opts };
  return getExplorerMemoized(opts);
}

function _resolveConfig(filePath, opts, sync) {
  opts = { useCache: true, ...opts };
  const loadOpts = {
    cache: Boolean(opts.useCache),
    sync: Boolean(sync),
    editorconfig: Boolean(opts.editorconfig),
  };
  const { load, search } = getExplorer(loadOpts);
  const loadEditorConfig = resolveEditorConfig.getLoadFunction(loadOpts);
  /** @type {[any, any]} */
  const arr = [
    opts.config ? load(opts.config) : search(filePath),
    loadEditorConfig(filePath),
  ];

  const unwrapAndMerge = ([result, editorConfigured]) => {
    const merged = {
      ...editorConfigured,
      ...mergeOverrides(result, filePath),
    };

    for (const optionName of ["plugins", "pluginSearchDirs"]) {
      if (Array.isArray(merged[optionName])) {
        merged[optionName] = merged[optionName].map((value) =>
          typeof value === "string" && value.startsWith(".") // relative path
            ? path.resolve(path.dirname(result.filepath), value)
            : value
        );
      }
    }

    if (!result && !editorConfigured) {
      return null;
    }

    // We are not using this option
    delete merged.insertFinalNewline;
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
  memClear(getExplorerMemoized);
  resolveEditorConfig.clearCache();
}

async function resolveConfigFile(filePath) {
  const { search } = getExplorer({ sync: false });
  const result = await search(filePath);
  return result ? result.filepath : null;
}

resolveConfigFile.sync = (filePath) => {
  const { search } = getExplorer({ sync: true });
  const result = search(filePath);
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
  const patternList = Array.isArray(patterns) ? patterns : [patterns];
  // micromatch always matches against basename when the option is enabled
  // use only patterns without slashes with it to match minimatch behavior
  const [withSlashes, withoutSlashes] = partition(patternList, (pattern) =>
    pattern.includes("/")
  );

  return (
    micromatch.isMatch(filePath, withoutSlashes, {
      ignore: excludedPatterns,
      basename: true,
      dot: true,
    }) ||
    micromatch.isMatch(filePath, withSlashes, {
      ignore: excludedPatterns,
      basename: false,
      dot: true,
    })
  );
}

module.exports = {
  resolveConfig,
  resolveConfigFile,
  clearCache,
};
