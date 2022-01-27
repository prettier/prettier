"use strict";

/**
 * @param {any} object
 * @returns {object is Array<any>}
 */
function isNonEmptyArray(object) {
  return Array.isArray(object) && object.length > 0;
}

module.exports = isNonEmptyArray;
