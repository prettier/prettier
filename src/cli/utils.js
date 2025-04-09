import fs from "node:fs/promises";
import path from "node:path";
import sdbm from "sdbm";
// @ts-expect-error
import { __internal as sharedWithCli } from "../index.js";

// eslint-disable-next-line no-console
const printToScreen = console.log.bind(console);

/**
 * @template Obj
 * @template Key
 * @param {Array<Obj>} array
 * @param {(value: Obj) => Key} iteratee
 * @returns {{[p in Key]: T}}
 */
function groupBy(array, iteratee) {
  const result = Object.create(null);

  for (const value of array) {
    const key = iteratee(value);

    if (Array.isArray(result[key])) {
      result[key].push(value);
    } else {
      result[key] = [value];
    }
  }

  return result;
}

/**
 * @template Obj
 * @template {keyof Obj} Keys
 * @param {Obj} object
 * @param {Array<Keys>} keys
 * @returns {{[key in Keys]: Obj[key]}}
 */
function pick(object, keys) {
  const entries = keys.map((key) => [key, object[key]]);
  return Object.fromEntries(entries);
}

/**
 * @param {string} source
 * @returns {string}
 */
function createHash(source) {
  return String(sdbm(source));
}

/** @import {Stats} from "fs" */
/**
 * Get stats of a given path.
 * @param {string} filePath The path to target file.
 * @returns {Promise<Stats | undefined>} The stats.
 */
async function statSafe(filePath) {
  try {
    return await fs.stat(filePath);
  } catch (/** @type {any} */ error) {
    /* c8 ignore next 3 */
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

/**
 * Get stats of a given path without following symbolic links.
 * @param {string} filePath The path to target file.
 * @returns {Promise<Stats | undefined>} The stats.
 */
async function lstatSafe(filePath) {
  try {
    return await fs.lstat(filePath);
  } catch (/** @type {any} */ error) {
    /* c8 ignore next 3 */
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function isJson(value) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Replace `\` with `/` on Windows
 * @param {string} filepath
 * @returns {string}
 */
const normalizeToPosix =
  path.sep === "\\"
    ? (filepath) => filepath.replaceAll("\\", "/")
    : (filepath) => filepath;

export const { omit } = sharedWithCli.utils;
export {
  createHash,
  groupBy,
  isJson,
  lstatSafe,
  normalizeToPosix,
  pick,
  printToScreen,
  statSafe,
};
