"use strict";

const { runGit } = require("../utils");

module.exports = async function () {
  const { stdout: status } = await runGit(["status", "--porcelain"]);

  if (status) {
    throw new Error(
      "Uncommitted local changes. " +
        "Please revert or commit all local changes before making a release."
    );
  }
};
