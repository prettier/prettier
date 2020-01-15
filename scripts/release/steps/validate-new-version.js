"use strict";

const chalk = require("chalk");
const semver = require("semver");

module.exports = async function({ version, previousVersion }) {
  if (!semver.valid(version)) {
    throw Error("Invalid version specified");
  }

  if (!semver.gt(version, previousVersion)) {
    throw Error(`Version ${chalk.yellow(version)} has already been published`);
  }
};
