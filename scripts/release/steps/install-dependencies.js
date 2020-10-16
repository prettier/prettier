"use strict";

const execa = require("execa");
const { runYarn, runGit, logPromise } = require("../utils");

async function install() {
  await execa("rm", ["-rf", "node_modules"]);
  await runYarn(["install"]);

  const { stdout: status } = await runGit(["ls-files", "-m"]);
  if (status) {
    throw new Error(
      "The lockfile needs to be updated, commit it before making the release."
    );
  }
}

module.exports = function () {
  return logPromise("Installing NPM dependencies", install());
};
