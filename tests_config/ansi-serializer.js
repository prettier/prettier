"use strict";

const hasAnsi = require("has-ansi");
const stripAnsi = require("strip-ansi");

module.exports = {
  print(value, serialize) {
    return serialize(stripAnsi(value));
  },
  test(value) {
    return typeof value === "string" && hasAnsi(value);
  }
};
