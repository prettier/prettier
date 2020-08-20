"use strict";

/**
 * @param {object} object
 * @param {string} keyName
 * @returns any[]
 */
module.exports = (object, keyName) =>
  Object.entries(object).map(([key, value]) => ({
    [keyName]: key,
    ...value,
  }));
