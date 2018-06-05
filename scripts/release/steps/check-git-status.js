"use strict";

const { exec } = require("child-process-promise");

module.exports = async function() {
  const status = (await exec("git status --porcelain")).stdout;

  if (status) {
    throw Error(
      "Uncommited local changes. " +
        "Please revert or commit all local changes before making a release."
    );
  }
};
