"use strict";

const { exec } = require("child-process-promise");
const { logPromise } = require("../utils");

async function install() {
  await exec("rm -rf node_modules");
  await exec("yarn install");

  const status = (await exec("git ls-files -m")).stdout.trim();
  if (status) {
    throw Error(
      "The lockfile needs to be updated, commit it before making the release."
    );
  }
}

module.exports = function() {
  return logPromise("Installing NPM dependencies", install());
};
