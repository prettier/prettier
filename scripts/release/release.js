#!/usr/bin/env node

"use strict";

const { exec } = require("child_process");

async function run() {
  const chalk = require("chalk");
  const minimist = require("minimist");
  const semver = require("semver");
  const { string: outdentString } = require("outdent");
  const { runGit, readJson } = require("./utils.js");

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

  const steps = [
    require("./steps/validate-new-version.js"),
    require("./steps/check-git-status.js"),
    require("./steps/install-dependencies.js"),
    require("./steps/run-tests.js"),
    require("./steps/update-version.js"),
    require("./steps/generate-bundles.js"),
    require("./steps/update-changelog.js"),
    require("./steps/push-to-git.js"),
    require("./steps/publish-to-npm.js"),
    require("./steps/bump-prettier.js"),
    require("./steps/update-dependents-count.js"),
    require("./steps/post-publish-steps.js"),
  ];

  try {
    for (const step of steps) {
      await step(params);
    }
  } catch (error) {
    const message = outdentString(error.message.trim());
    const stack = error.stack.replace(message, "");
    console.error(`${chalk.red("error")} ${message}\n${stack}`);
    process.exit(1);
  }
}

exec(
  [
    "git fetch --tags", // Fetch git tags to get the previous version number (i.e. the latest tag)
    "yarn install", // Install script's dependencies before any require
  ].join(" && "),
  { cwd: __dirname },
  (error) => {
    if (error) {
      console.error(error);
      process.exit(1);
    } else {
      run();
    }
  }
);
