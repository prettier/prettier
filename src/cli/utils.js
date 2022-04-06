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

function partition(array, predicate) {
  const result = [[], []];

  for (const value of array) {
    result[predicate(value) ? 0 : 1].push(value);
  }

  return result;
}

module.exports = { printToScreen, groupBy, partition };
