// Inspired by LintResultsCache from ESLint
// https://github.com/eslint/eslint/blob/c2d0a830754b6099a3325e6d3348c3ba983a677a/lib/cli-engine/lint-result-cache.js

import stringify from "fast-json-stable-stringify";
import fileEntryCache from "file-entry-cache";
import { version as prettierVersion } from "../index.js";
import { createHash } from "./utils.js";

const optionsHashCache = new WeakMap();
const nodeVersion = process.version;

/**
 * @param {*} options
 * @returns {string}
 */
function getHashOfOptions(options) {
  if (optionsHashCache.has(options)) {
    return optionsHashCache.get(options);
  }
  const hash = createHash(
    `${prettierVersion}_${nodeVersion}_${stringify(options)}`,
  );
  optionsHashCache.set(options, hash);
  return hash;
}

/**
 * @typedef {{ hashOfOptions?: string }} OurMeta
 * @typedef {import("file-entry-cache").FileDescriptor} FileDescriptor
 *
 * @param {import("file-entry-cache").FileDescriptor} fileDescriptor
 * @returns {FileDescriptor["meta"] & OurMeta}
 */
function getMetadataFromFileDescriptor(fileDescriptor) {
  return fileDescriptor.meta;
}

class FormatResultsCache {
  #fileEntryCache;

  /**
   * @param {string} cacheFileLocation The path of cache file location. (default: `node_modules/.cache/prettier/.prettier-cache`)
   * @param {string} cacheStrategy
   */
  constructor(cacheFileLocation, cacheStrategy) {
    const useChecksum = cacheStrategy === "content";

    this.#fileEntryCache = fileEntryCache.create(
      /* cacheId */ cacheFileLocation,
      /* directory */ undefined,
      useChecksum,
    );
  }

  /**
   * @param {string} filePath
   * @param {any} options
   */
  existsAvailableFormatResultsCache(filePath, options) {
    const fileDescriptor = this.#fileEntryCache.getFileDescriptor(filePath);

    /* c8 ignore next 3 */
    if (fileDescriptor.notFound) {
      return false;
    }

    const hashOfOptions = getHashOfOptions(options);
    const meta = getMetadataFromFileDescriptor(fileDescriptor);
    const changed =
      fileDescriptor.changed || meta.hashOfOptions !== hashOfOptions;

    return !changed;
  }

  /**
   * @param {string} filePath
   * @param {any} options
   */
  setFormatResultsCache(filePath, options) {
    const fileDescriptor = this.#fileEntryCache.getFileDescriptor(filePath);
    const meta = getMetadataFromFileDescriptor(fileDescriptor);
    if (fileDescriptor && !fileDescriptor.notFound) {
      meta.hashOfOptions = getHashOfOptions(options);
    }
  }

  /**
   * @param {string} filePath
   */
  removeFormatResultsCache(filePath) {
    this.#fileEntryCache.removeEntry(filePath);
  }

  reconcile() {
    this.#fileEntryCache.reconcile();
  }
}

export default FormatResultsCache;
