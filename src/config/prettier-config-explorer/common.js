import fs from "node:fs/promises";
import path from "node:path";

const CONFIG_FILE_NAMES = [
  "package.json",
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.yaml",
  ".prettierrc.yml",
  ".prettierrc.json5",
  ".prettierrc.js",
  ".prettierrc.mjs",
  ".prettierrc.cjs",
  "prettier.config.js",
  "prettier.config.mjs",
  "prettier.config.cjs",
  ".prettierrc.toml",
];

async function fileExists(file) {
  let stats;
  try {
    stats = await fs.stat(file);
  } catch {
    return false;
  }

  return stats.isFile();
}

function* getParentDirectories(from, to) {
  const { root } = path.parse(from);
  for (let directory = from; ; directory = path.dirname(directory)) {
    yield directory;

    if (directory === to || directory === root) {
      return;
    }
  }
}

function createCachedFunction(function_) {
  const cache = new Map();

  return async function (fileOrDirectory) {
    if (cache.has(fileOrDirectory)) {
      return cache.get(fileOrDirectory);
    }

    const promise = function_(fileOrDirectory);
    cache.set(fileOrDirectory, promise);
    const result = await promise;
    cache.set(fileOrDirectory, result);
    return result;
  };
}

export {
  CONFIG_FILE_NAMES,
  fileExists,
  getParentDirectories,
  createCachedFunction,
};
