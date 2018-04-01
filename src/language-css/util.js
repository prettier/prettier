"use strict";

function maybeToLowerCase(value) {
  return value.includes("$") ||
    value.includes("@") ||
    value.includes("#") ||
    value.startsWith("%") ||
    value.startsWith("--")
    ? value
    : value.toLowerCase();
}

module.exports = {
  maybeToLowerCase
};
