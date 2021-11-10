"use strict";

function tryCombinations(...combinations) {
  let firstError;
  for (const [index, fn] of combinations.entries()) {
    try {
      return { result: fn() };
    } catch (error) {
      if (index === 0) {
        firstError = error;
      }
    }
  }
  return { error: firstError };
}

module.exports = tryCombinations;
