"use strict";

const { execYarn, logPromise } = require("../utils");

module.exports = async function() {
  await logPromise("Running linter", execYarn("lint"));
  await logPromise("Running linter on docs", execYarn("lint-docs"));
  await logPromise("Running tests", execYarn("test"));
};
