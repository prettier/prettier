import path from "node:path";

import editorconfig from "editorconfig";
import editorConfigToPrettier from "editorconfig-to-prettier";
import mem, { memClear } from "mem";
import findProjectRoot from "./find-project-root.js";

const jsonStringifyMem = (fn) => mem(fn, { cacheKey: JSON.stringify });

const maybeParse = (filePath, parse) =>
  filePath &&
  parse(filePath, {
    root: findProjectRoot(path.dirname(path.resolve(filePath))),
  });

const editorconfigAsyncNoCache = async (filePath) =>
  editorConfigToPrettier(await maybeParse(filePath, editorconfig.parse));
const editorconfigAsyncWithCache = jsonStringifyMem(editorconfigAsyncNoCache);

const editorconfigSyncNoCache = (filePath) =>
  editorConfigToPrettier(maybeParse(filePath, editorconfig.parseSync));
const editorconfigSyncWithCache = jsonStringifyMem(editorconfigSyncNoCache);

function getLoadFunction(opts) {
  if (!opts.editorconfig) {
    return () => null;
  }

  if (opts.sync) {
    return opts.cache ? editorconfigSyncWithCache : editorconfigSyncNoCache;
  }

  return opts.cache ? editorconfigAsyncWithCache : editorconfigAsyncNoCache;
}

function clearCache() {
  memClear(editorconfigSyncWithCache);
  memClear(editorconfigAsyncWithCache);
}

export { getLoadFunction, clearCache };
