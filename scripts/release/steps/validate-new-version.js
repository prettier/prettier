"use strict";

const chalk = require("chalk");
const semver = require("semver");

module.exports = function ({ version, previousVersion }) {
  if (!semver.valid(version)) {
    throw new Error("Invalid version specified");
  }

  if (!semver.gt(version, previousVersion)) {
    throw new Error(
      `Version ${chalk.yellow(version)} has already been published`
    );
  }
};
