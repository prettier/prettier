"use strict";

const { exec } = require("child-process-promise");
const { logPromise } = require("../utils");

async function pushGit({ version }) {
  await exec(`git commit -am "${version}"`);
  await exec(`git tag -a "${version}" -m "Releasing version ${version}"`);
  await exec("git push");
  await exec("git push --tags");
}

module.exports = function(params) {
  if (params.dry) {
    return;
  }

  return logPromise("Committing and pushing to remote", pushGit(params));
};
