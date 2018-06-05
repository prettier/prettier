"use strict";

const { exec, spawn } = require("child-process-promise");
const { logPromise } = require("../utils");

async function pushGit({ version }) {
  await spawn("git", ["commit", "-am", `Release ${version}`]);
  await spawn("git", ["tag", "-a", version, "-m", `Release ${version}`]);
  await exec("git push");
  await exec("git push --tags");
}

module.exports = function(params) {
  if (params.dry) {
    return;
  }

  return logPromise("Committing and pushing to remote", pushGit(params));
};
