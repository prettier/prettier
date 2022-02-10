"use strict";

const isNonEmptyArray = require("../../utils/is-non-empty-array.js");

function hasSCSSInterpolation(groupList) {
  if (isNonEmptyArray(groupList)) {
    for (let i = groupList.length - 1; i > 0; i--) {
      // If we find `#{`, return true.
      if (
        groupList[i].type === "word" &&
        groupList[i].value === "{" &&
        groupList[i - 1].type === "word" &&
        groupList[i - 1].value.endsWith("#")
      ) {
        return true;
      }
    }
  }
  return false;
}

module.exports = hasSCSSInterpolation;
