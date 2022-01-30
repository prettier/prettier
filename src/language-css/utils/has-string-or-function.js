"use strict";

const isNonEmptyArray = require("../../utils/is-non-empty-array.js");

function hasStringOrFunction(groupList) {
  if (isNonEmptyArray(groupList)) {
    for (let i = 0; i < groupList.length; i++) {
      if (groupList[i].type === "string" || groupList[i].type === "func") {
        return true;
      }
    }
  }
  return false;
}

module.exports = hasStringOrFunction;
