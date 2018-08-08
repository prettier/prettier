"use strict";

const hasAnsi = require("has-ansi");
const stripAnsi = require("strip-ansi");

module.exports = {
  print(value) {
    return stripAnsi(value);
  },
  test(value) {
    return typeof value === "string" && hasAnsi(value);
  }
};
