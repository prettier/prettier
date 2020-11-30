"use strict";

function tryCombinations(combinations, fn) {
  let firstError;
  for (const [index, item] of combinations.entries()) {
    try {
      return { result: fn(item) };
    } catch (error) {
      if (index === 0) {
        firstError = error;
      }
    }
  }
  return { error: firstError };
}

module.exports = tryCombinations;
