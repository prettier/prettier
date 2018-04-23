"use strict";

module.exports = function(object, keyName) {
  return Object.keys(object).reduce(
    (array, key) =>
      array.concat(Object.assign({ [keyName]: key }, object[key])),
    []
  );
};
