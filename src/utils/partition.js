"use strict";

const reduce = Array.prototype.reduce;

module.exports = function partition(array, fn) {
  return reduce.call(
    array,
    (result, item) => {
      result[fn(item) ? 0 : 1].push(item);
      return result;
    },
    [[], []]
  );
};
