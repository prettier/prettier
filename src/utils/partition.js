"use strict";

function partition(array, predicate) {
  const result = [[], []];

  for (const value of array) {
    result[predicate(value) ? 0 : 1].push(value);
  }

  return result;
}

module.exports = partition;
