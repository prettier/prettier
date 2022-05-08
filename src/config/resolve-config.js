import { createRequire } from "node:module";
import path from "node:path";
import micromatch from "micromatch";
import mem, { memClear } from "mem";
import thirdParty from "../common/third-party.cjs";
import loadToml from "../utils/load-toml.js";
import loadJson5 from "../utils/load-json5.js";
import resolve from "../common/resolve.js";
import partition from "../utils/partition.js";
import * as resolveEditorConfig from "./resolve-config-editorconfig.js";

/**
 * @typedef {ReturnType<import("cosmiconfig").cosmiconfig>} Explorer
 * @typedef {{cache?: boolean }} Options
 */

/**
 * @template {Options} Opts
 * @param {Opts} opts
 * @return {Explorer}
 */
const getExplorerMemoized = mem(
  (opts) => {
    const require = createRequire(import.meta.url);
    const { cosmiconfig } = thirdParty;
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
 * @param {Options} [options]
 * @return {Explorer}
 */
function getExplorer(options) {
  return getExplorerMemoized(
    // Normalize opts before passing to a memoized function
    { cache: false, ...options }
  );
}

async function resolveConfig(filePath, opts) {
  opts = { useCache: true, ...opts };
  const loadOpts = {
    cache: Boolean(opts.useCache),
    editorconfig: Boolean(opts.editorconfig),
  };
  const { load, search } = getExplorer(loadOpts);
  const loadEditorConfig = resolveEditorConfig.getLoadFunction(loadOpts);

  const [result, editorConfigured] = await Promise.all([
    opts.config ? load(opts.config) : search(filePath),
    loadEditorConfig(filePath),
  ]);

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

  return merged;
}

function clearCache() {
  memClear(getExplorerMemoized);
  resolveEditorConfig.clearCache();
}

async function resolveConfigFile(filePath) {
  const { search } = getExplorer();
  const result = await search(filePath);
  return result ? result.filepath : null;
}

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

export { resolveConfig, resolveConfigFile, clearCache };
