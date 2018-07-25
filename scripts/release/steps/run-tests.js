"use strict";

const { runYarn, logPromise } = require("../utils");

module.exports = async function() {
  await logPromise("Running linter", runYarn("lint"));
  await logPromise("Running linter on docs", runYarn("lint-docs"));
  await logPromise("Running tests", runYarn("test"));
};
