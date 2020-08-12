"use strict";

const path = require("path");
const minimatch = require("minimatch");
const mem = require("mem");
const thirdParty = require("../common/third-party");

const loadToml = require("../utils/load-toml");
const resolve = require("../common/resolve");
const resolveEditorConfig = require("./resolve-config-editorconfig");

/**
 * @typedef {object} ConfigOptions
 * @property {string?} config
 * @property {boolean?} useCache
 * @property {boolean?} sync
 * @property {boolean?} editorconfig
 *
 * @typedef {{config: string} | {cache: boolean} | {sync: boolean}} ExplorerOptions
 */

const getExplorerMemoized = mem(
  (opts) => {
    const cosmiconfig = opts.sync
      ? thirdParty.cosmiconfigSync
      : thirdParty.cosmiconfig;

    const explorer = cosmiconfig("prettier", {
      cache: opts.cache,
      transform: (result) => {
        if (result && result.config) {
          if (typeof result.config === "string") {
            const dir = path.dirname(result.filepath);
            const modulePath = resolve(result.config, { paths: [dir] });
            result.config = eval("require")(modulePath);
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
        ".prettierrc.cjs",
        "prettier.config.js",
        "prettier.config.cjs",
        ".prettierrc.toml",
      ],
      loaders: {
        ".toml": loadToml,
      },
    });

    return explorer;
  },
  { cacheKey: JSON.stringify }
);

/** @param {ExplorerOptions} opts */
function getExplorer(opts) {
  // Normalize opts before passing to a memoized function
  opts = { sync: false, cache: false, ...opts };
  return getExplorerMemoized(opts);
}

/**
 * @param {string} filePath
 * @param {ConfigOptions} opts
 * @param {boolean} sync
 */
function _resolveConfig(filePath, opts, sync) {
  opts = { useCache: true, ...opts };
  const loadOpts = {
    cache: !!opts.useCache,
    sync: !!sync,
    editorconfig: !!opts.editorconfig,
  };
  const { load, search } = getExplorer(loadOpts);
  const loadEditorConfig = resolveEditorConfig.getLoadFunction(loadOpts);
  const arr = [
    opts.config ? load(opts.config) : search(filePath),
    loadEditorConfig(filePath),
  ];

  //* ** TODO make this function type more specific:
  /** @type {(...args: any[]) => any} */
  const unwrapAndMerge = ([result, editorConfigured]) => {
    const merged = {
      ...editorConfigured,
      ...mergeOverrides(result, filePath),
    };

    ["plugins", "pluginSearchDirs"].forEach((optionName) => {
      if (Array.isArray(merged[optionName])) {
        // TODO use a more specific argument type in map function:
        merged[optionName] = merged[optionName].map((/** @type{any} */ value) =>
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

/**
 * @type {((filePath: string, opts: ConfigOptions) => boolean) & {sync: Function}}
 */
const resolveConfig = (filePath, opts) => _resolveConfig(filePath, opts, false);

/** @type{(filePath: string, opts: ConfigOptions) => boolean} */
resolveConfig.sync = (filePath, opts) => _resolveConfig(filePath, opts, true);

function clearCache() {
  mem.clear(getExplorerMemoized);
  resolveEditorConfig.clearCache();
}

/** @param {string} filePath */
async function resolveConfigFile(filePath) {
  const { search } = getExplorer({ sync: false });
  const result = await search(filePath);
  return result ? result.filepath : null;
}

/** @param {string} filePath */
resolveConfigFile.sync = (filePath) => {
  const { search } = getExplorer({ sync: true });
  const result = search(filePath);
  // @ts-ignore - TODO (...)
  return result ? result.filepath : null;
};

/**
 * @param {any} configResult - TODO (...)
 * @param {string} filePath
 */
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

/**
 * Based on eslint:
 * https://github.com/eslint/eslint/blob/master/lib/config/config-ops.js
 *
 * @param {string} filePath
 * @param {string[]} patterns
 * @param {string[]} excludedPatterns
 */
function pathMatchesGlobs(filePath, patterns, excludedPatterns) {
  // @ts-ignore - TODO (...)
  const patternList = [].concat(patterns);
  // @ts-ignore - TODO (...)
  const excludedPatternList = [].concat(excludedPatterns || []);
  const opts = { matchBase: true, dot: true };

  return (
    patternList.some((pattern) => minimatch(filePath, pattern, opts)) &&
    !excludedPatternList.some((excludedPattern) =>
      minimatch(filePath, excludedPattern, opts)
    )
  );
}

module.exports = {
  resolveConfig,
  resolveConfigFile,
  clearCache,
};
