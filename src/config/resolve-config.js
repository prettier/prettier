import path from "node:path";
import micromatch from "micromatch";
import mem, { memClear } from "mem";
import partition from "../utils/partition.js";
import loadEditorConfigWithoutCache from "./resolve-editorconfig.js";
import getPrettierConfigExplorerWithoutCache from "./get-prettier-config-explorer.js";

const getPrettierConfigExplorer = mem(getPrettierConfigExplorerWithoutCache, {
  cacheKey: ([options]) => options.cache,
});
const memoizedLoadEditorConfig = mem(loadEditorConfigWithoutCache);
function clearCache() {
  memClear(getPrettierConfigExplorer);
  memClear(memoizedLoadEditorConfig);
}

function loadEditorConfig(filePath, options) {
  if (!filePath || !options.editorconfig) {
    return;
  }

  return (
    options.useCache ? memoizedLoadEditorConfig : loadEditorConfigWithoutCache
  )(filePath);
}

function loadPrettierConfig(filePath, options) {
  const { useCache, config: configPath } = options;
  const { load, search } = getPrettierConfigExplorer({
    cache: Boolean(useCache),
  });
  return configPath ? load(configPath) : search(filePath);
}

async function resolveConfig(filePath, options) {
  options = { useCache: true, ...options };

  const [result, editorConfigured] = await Promise.all([
    loadPrettierConfig(filePath, options),
    loadEditorConfig(filePath, options),
  ]);

  if (!result && !editorConfigured) {
    return null;
  }

  const merged = {
    ...editorConfigured,
    ...mergeOverrides(result, filePath),
  };

  if (Array.isArray(merged.plugins)) {
    merged.plugins = merged.plugins.map((value) =>
      typeof value === "string" && value.startsWith(".") // relative path
        ? path.resolve(path.dirname(result.filepath), value)
        : value,
    );
  }

  return merged;
}

async function resolveConfigFile(filePath) {
  const { search } = getPrettierConfigExplorer({ cache: false });
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
          override.excludeFiles,
        )
      ) {
        Object.assign(options, {
          __ignore: override.ignore === true,
          ...override.options,
        });
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
    pattern.includes("/"),
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
