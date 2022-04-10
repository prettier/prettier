"use strict";

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

module.exports = { printToScreen, groupBy, pick };
