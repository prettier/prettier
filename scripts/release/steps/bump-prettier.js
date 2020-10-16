"use strict";

const semver = require("semver");
const {
  runYarn,
  runGit,
  logPromise,
  readJson,
  writeJson,
} = require("../utils");

async function format() {
  await runYarn(["lint:eslint", "--fix"]);
  await runYarn(["lint:prettier", "--write"]);
}

async function commit(version) {
  await runGit(["commit", "-am", `Bump Prettier dependency to ${version}`]);
  await runGit(["push"]);
}

async function bump({ version, previousVersion, previousVersionOnMaster }) {
  const pkg = await readJson("package.json");
  if (semver.diff(version, previousVersion) === "patch") {
    pkg.version = previousVersionOnMaster; // restore the `-dev` version
  } else {
    pkg.version = semver.inc(version, "minor") + "-dev";
  }
  await writeJson("package.json", pkg, { spaces: 2 });
}

module.exports = async function (params) {
  const { dry, version } = params;

  if (dry) {
    return;
  }

  await logPromise(
    "Installing Prettier",
    runYarn(["add", "--dev", `prettier@${version}`])
  );

  await logPromise("Updating files", format());
  await logPromise("Bump master version", bump(params));
  await logPromise("Committing changed files", commit(version));
};
