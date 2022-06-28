import { promises as fs } from "node:fs";
import sdbm from "sdbm";
import { __internal as sharedWithCli } from "../index.js";

const { arrayify, getLast, isNonEmptyArray, partition } = sharedWithCli.utils;

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

/**
 * Get stats of a given path.
 * @param {string} filePath The path to target file.
 * @returns {Promise<import('fs').Stats | undefined>} The stats.
 */
async function statSafe(filePath) {
  try {
    return await fs.stat(filePath);
  } catch (error) {
    /* istanbul ignore next */
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

export {
  arrayify,
  getLast,
  isNonEmptyArray,
  partition,
  printToScreen,
  groupBy,
  pick,
  createHash,
  statSafe,
};
