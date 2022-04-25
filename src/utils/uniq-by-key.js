"use strict";

/**
 * @template {object} Element
 * @param {Array<Element>} array
 * @param {string | number | symbol} key
 * @returns
 */
function uniqByKey(array, key) {
  const result = [];
  const seen = new Set();

  for (const element of array) {
    const value = element[key];
    if (!seen.has(value)) {
      seen.add(value);
      result.push(element);
    }
  }

  return result;
}

module.exports = uniqByKey;
