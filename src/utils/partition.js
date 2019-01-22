"use strict";

module.exports = function partition(array, fn) {
  const a = [];
  const b = [];
  array.forEach(item => {
    if (fn(item)) {
      a.push(item);
    } else {
      b.push(item);
    }
  });
  return [a, b];
};
