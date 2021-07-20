#!/usr/bin/env node

import { exec } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

async function run() {
  const { default: chalk } = await import("chalk");
  const { default: minimist } = await import("minimist");
  const { default: semver } = await import("semver");
  const {
    default: { string: outdentString },
  } = await import("outdent");
  const { runGit, readJson } = await import("./utils.js");

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
    "./steps/validate-new-version.js",
    "./steps/check-git-status.js",
    "./steps/install-dependencies.js",
    "./steps/run-tests.js",
    "./steps/update-version.js",
    "./steps/generate-bundles.js",
    "./steps/update-changelog.js",
    "./steps/push-to-git.js",
    "./steps/publish-to-npm.js",
    "./steps/bump-prettier.js",
    "./steps/update-dependents-count.js",
    "./steps/post-publish-steps.js",
  ];

  try {
    for (const file of steps) {
      const { default: step } = await import(file);
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
  { cwd: path.dirname(fileURLToPath(import.meta.url)) },
  (error) => {
    if (error) {
      console.error(error);
      process.exit(1);
    } else {
      run();
    }
  }
);
