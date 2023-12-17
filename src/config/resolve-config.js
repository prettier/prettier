import path from "node:path";

import mem, { memClear } from "mem";
import micromatch from "micromatch";
import { toPath } from "url-or-path";

import partition from "../utils/partition.js";
import {
  clearCache as clearPrettierConfigCache,
  loadConfig as loadPrettierConfigFile,
  searchConfig as searchPrettierConfig,
} from "./prettier-config-explorer/index.js";
import loadEditorConfigWithoutCache from "./resolve-editorconfig.js";

const memoizedLoadEditorConfig = mem(loadEditorConfigWithoutCache);
function clearCache() {
  clearPrettierConfigCache();
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

async function loadPrettierConfig(filePath, options) {
  const shouldCache = options.useCache;
  let configFile = options.config;

  if (!configFile) {
    const directory = filePath
      ? path.dirname(path.resolve(filePath))
      : undefined;
    configFile = await searchPrettierConfig(directory, { shouldCache });
  }

  if (!configFile) {
    return;
  }

  const config = await loadPrettierConfigFile(configFile, { shouldCache });

  return { config, configFile };
}

async function resolveConfig(fileUrlOrPath, options) {
  options = { useCache: true, ...options };
  const filePath = toPath(fileUrlOrPath);

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
        ? path.resolve(path.dirname(result.configFile), value)
        : value,
    );
  }

  return merged;
}

async function resolveConfigFile(fileUrlOrPath) {
  const directory = fileUrlOrPath
    ? path.dirname(path.resolve(toPath(fileUrlOrPath)))
    : undefined;
  const result = await searchPrettierConfig(directory, { shouldCache: false });
  return result ?? null;
}

function mergeOverrides(configResult, filePath) {
  const { config, configFile } = configResult || {};
  const { overrides, ...options } = config || {};
  if (filePath && overrides) {
    const relativeFilePath = path.relative(path.dirname(configFile), filePath);
    for (const override of overrides) {
      if (
        pathMatchesGlobs(
          relativeFilePath,
          override.files,
          override.excludeFiles,
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

export { clearCache, resolveConfig, resolveConfigFile };
