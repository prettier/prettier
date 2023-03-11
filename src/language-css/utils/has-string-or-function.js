"use strict";

function hasStringOrFunction(groupList) {
  return groupList.some(
    (group) =>
      group.type === "string" ||
      (group.type === "func" &&
        // workaround false-positive func
        !group.value.endsWith("\\"))
  );
}

module.exports = hasStringOrFunction;
