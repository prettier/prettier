"use strict";

const chalk = require("chalk");
const { execYarn, logPromise, readJson } = require("../utils");

module.exports = async function({ version }) {
  await logPromise("Generating bundles", execYarn("build"));

  const builtPkg = await readJson("dist/package.json");
  if (builtPkg.version !== version) {
    throw Error(
      `Expected ${version} in dist/package.json but found ${builtPkg.version}`
    );
  }

  await logPromise("Running tests on generated bundles", execYarn("test:dist"));

  console.log(chalk.green.bold("Build successful!\n"));
};
