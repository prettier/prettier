// Inspired by LintResultsCache from ESLint
// https://github.com/eslint/eslint/blob/c2d0a830754b6099a3325e6d3348c3ba983a677a/lib/cli-engine/lint-result-cache.js

import fs from "node:fs";
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
 * @import {FileDescriptor, FileDescriptorMeta} from "file-entry-cache"
 *
 * @param {FileDescriptor} fileDescriptor
 * @returns {FileDescriptorMeta & {data?: {hashOfOptions?: string }}}}
 */
function getMetadataFromFileDescriptor(fileDescriptor) {
  return fileDescriptor.meta;
}

class FormatResultsCache {
  #useChecksum;
  #fileEntryCache;

  /**
   * @param {string} cacheFileLocation The path of cache file location. (default: `node_modules/.cache/prettier/.prettier-cache`)
   * @param {string} cacheStrategy
   */
  constructor(cacheFileLocation, cacheStrategy) {
    const useChecksum = cacheStrategy === "content";

    try {
      this.#fileEntryCache = fileEntryCache.createFromFile(
        /* filePath */ cacheFileLocation,
        useChecksum,
      );
    } catch {
      // https://github.com/prettier/prettier/issues/17092
      // If `createFromFile()` fails, it's probably because the format
      // of cache file changed,it happened when we release v3.5.0
      if (fs.existsSync(cacheFileLocation)) {
        fs.unlinkSync(cacheFileLocation);
        // retry
        this.#fileEntryCache = fileEntryCache.createFromFile(
          /* filePath */ cacheFileLocation,
          useChecksum,
        );
      }
    }

    this.#useChecksum = useChecksum;
  }

  /**
   * @param {string} filePath
   * @param {any} options
   */
  existsAvailableFormatResultsCache(filePath, options) {
    const fileDescriptor = this.#getFileDescriptor(filePath);
    if (fileDescriptor.notFound || fileDescriptor.changed) {
      return false;
    }

    const hashOfOptions =
      getMetadataFromFileDescriptor(fileDescriptor).data?.hashOfOptions;
    return hashOfOptions && hashOfOptions === getHashOfOptions(options);
  }

  /**
   * @param {string} filePath
   * @param {any} options
   */
  setFormatResultsCache(filePath, options) {
    const fileDescriptor = this.#getFileDescriptor(filePath);
    if (!fileDescriptor.notFound) {
      const meta = getMetadataFromFileDescriptor(fileDescriptor);
      meta.data = { ...meta.data, hashOfOptions: getHashOfOptions(options) };
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

  #getFileDescriptor(filePath) {
    return this.#fileEntryCache.getFileDescriptor(filePath, {
      useModifiedTime: !this.#useChecksum,
    });
  }
}

export default FormatResultsCache;
