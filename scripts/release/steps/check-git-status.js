"use strict";

const execa = require("execa");

module.exports = async function() {
  const status = await execa.stdout("git", ["status", "--porcelain"]);

  if (status) {
    throw Error(
      "Uncommitted local changes. " +
        "Please revert or commit all local changes before making a release."
    );
  }
};
