"use strict";

const execa = require("execa");
const { logPromise } = require("../utils");

async function format() {
  await execa("yarn", ["lint", "--fix"]);
  await execa("yarn", ["lint-docs", "--fix"]);
}

async function commit(version) {
  await execa("git", [
    "commit",
    "-am",
    `Bump Prettier dependency to ${version}`
  ]);
  await execa("git", ["push"]);
}

module.exports = async function({ dry, version }) {
  if (dry) {
    return;
  }

  await logPromise(
    "Installing Prettier",
    execa("yarn", ["add", "--dev", `prettier@${version}`])
  );

  await logPromise("Updating files", format());
  await logPromise("Committing changed files", commit(version));
};
