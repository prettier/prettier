import path from "node:path";
import micromatch from "micromatch";
import mem, { memClear } from "mem";
import { toPath } from "url-or-path";
import partition from "../utils/partition.js";
import loadEditorConfigWithoutCache from "./resolve-editorconfig.js";
import getPrettierConfigExplorerWithoutCache from "./get-prettier-config-explorer.js";
import findProjectRootWithoutCache from "./find-project-root.js";

const getPrettierConfigExplorer = mem(getPrettierConfigExplorerWithoutCache, {
  cacheKey: ([options]) =>
    JSON.stringify({
      cache: options.cache,
      stopDirectory: options.stopDirectory,
    }),
});
const memoizedLoadEditorConfig = mem(loadEditorConfigWithoutCache, {
  cacheKey: ([filePath, stopDirectory]) =>
    JSON.stringify({ filePath, stopDirectory }),
});
const memoizedFindProjectRoot = mem(findProjectRootWithoutCache);
function clearCache() {
  memClear(memoizedFindProjectRoot);
  memClear(getPrettierConfigExplorer);
  memClear(memoizedLoadEditorConfig);
}

async function loadEditorConfig(filePath, options) {
  if (!filePath || !options.editorconfig) {
    return;
  }

  const { useCache } = options;
  const stopDirectory = await (useCache
    ? memoizedFindProjectRoot
    : findProjectRootWithoutCache)(path.dirname(path.resolve(filePath)));

  return (
    options.useCache ? memoizedLoadEditorConfig : loadEditorConfigWithoutCache
  )(filePath, stopDirectory);
}

async function loadPrettierConfig(filePath, options) {
  const { useCache, config: configPath } = options;
  const stopDirectory = filePath
    ? await (useCache ? memoizedFindProjectRoot : findProjectRootWithoutCache)(
        path.dirname(path.resolve(filePath)),
      )
    : undefined;
  const { load, search } = getPrettierConfigExplorer({
    cache: Boolean(useCache),
    stopDirectory,
  });

  if (configPath) {
    return load(configPath);
  }

  if (!filePath) {
    return search();
  }

  const dirname = path.dirname(path.resolve(filePath));
  return search(dirname);
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
        ? path.resolve(path.dirname(result.filepath), value)
        : value,
    );
  }

  return merged;
}

async function resolveConfigFile(fileUrlOrPath) {
  const startDirectory = fileUrlOrPath
    ? path.dirname(path.resolve(toPath(fileUrlOrPath)))
    : undefined;
  const stopDirectory = startDirectory
    ? await findProjectRootWithoutCache(startDirectory)
    : undefined;
  const { search } = getPrettierConfigExplorerWithoutCache({ stopDirectory });
  const result = await search(startDirectory);
  return result?.filepath ?? null;
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

export { resolveConfig, resolveConfigFile, clearCache };
