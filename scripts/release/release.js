#!/usr/bin/env node

"use strict";

const chalk = require("chalk");
const minimist = require("minimist");
const semver = require("semver");
const { string: outdentString } = require("outdent");
const { runGit, runYarn, readJson } = require("./utils");

async function run() {
  // Fetch git tags to get the previous version number (i.e. the latest tag)
  await runGit(["fetch", "--tags"], { cwd: __dirname });
  // Install script's dependencies before any require
  await runYarn(["install"], { cwd: __dirname });

  const params = minimist(process.argv.slice(2), {
    string: ["version"],
    boolean: ["dry"],
    alias: { v: "version" },
  });

  const { stdout: previousVersion } = await runGit([
    "describe",
    "--tags",
    "--abbrev=0",
  ]);

  if (semver.parse(previousVersion) === null) {
    throw new Error(`Unexpected previousVersion: ${previousVersion}`);
  } else {
    params.previousVersion = previousVersion;
    params.previousVersionOnDefaultBranch = (
      await readJson("package.json")
    ).version;
  }

  params.previousVersion = previousVersion;
  params.previousVersionOnMaster = (await readJson("package.json")).version;

  const steps = [
    require("./steps/validate-new-version"),
    require("./steps/check-git-status"),
    require("./steps/install-dependencies"),
    require("./steps/run-tests"),
    require("./steps/update-version"),
    require("./steps/generate-bundles"),
    require("./steps/update-changelog"),
    require("./steps/push-to-git"),
    require("./steps/publish-to-npm"),
    require("./steps/bump-prettier"),
    require("./steps/update-dependents-count"),
    require("./steps/post-publish-steps"),
  ];

  for (const step of steps) {
    await step(params);
  }
}

run().catch((error) => {
  const message = outdentString(error.message.trim());
  const stack = error.stack.replace(message, "");
  console.error(`${chalk.red("error")} ${message}\n${stack}`);
  process.exit(1);
});
