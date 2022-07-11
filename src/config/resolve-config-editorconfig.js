import path from "node:path";

import editorconfig from "editorconfig";
import editorConfigToPrettier from "editorconfig-to-prettier";
import mem, { memClear } from "mem";
import findProjectRoot from "./find-project-root.js";

const jsonStringifyMem = (fn) => mem(fn, { cacheKey: JSON.stringify });

const memoizedLoadEditorConfig = jsonStringifyMem(loadEditorConfig);

async function loadEditorConfig(filePath) {
  if (!filePath) {
    return;
  }

  const editorConfig = await editorconfig.parse(filePath, {
    root: findProjectRoot(path.dirname(path.resolve(filePath))),
  });

  const config = editorConfigToPrettier(editorConfig);

  if (config) {
    // We are not using this option
    delete config.insertFinalNewline;
  }

  return config;
}

function getLoadFunction(opts) {
  if (!opts.editorconfig) {
    return () => {};
  }

  return opts.cache ? memoizedLoadEditorConfig : loadEditorConfig;
}

function clearCache() {
  memClear(memoizedLoadEditorConfig);
}

export { getLoadFunction, clearCache };
