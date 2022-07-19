"use strict";

function hasStringOrFunction(groupList) {
  return groupList.some(
    (group) => group.type === "string" || group.type === "func"
  );
}

module.exports = hasStringOrFunction;
