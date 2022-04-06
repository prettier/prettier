"use strict";

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
