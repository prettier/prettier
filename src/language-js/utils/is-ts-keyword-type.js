"use strict";
/**
 * @returns {boolean}
 */
function isTsKeywordType({ type }) {
  return type.startsWith("TS") && type.endsWith("Keyword");
}

module.exports = isTsKeywordType;
