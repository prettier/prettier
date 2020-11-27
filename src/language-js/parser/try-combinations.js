"use strict";

function tryCombinations(combinations, fn) {
  let result;
  const errors = [];
  for (const item of combinations) {
    try {
      result = fn(item);
      break;
    } catch (error) {
      errors.push(error);
    }
  }
  return [result, ...errors];
}

module.exports = tryCombinations;
