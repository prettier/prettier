"use strict";

// eslint-disable-next-line no-console
const printToScreen = console.log.bind(console);

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

function pick(object, keys) {
  return Object.fromEntries(keys.map((key) => [key, object[key]]));
}

module.exports = { printToScreen, groupBy, pick };
