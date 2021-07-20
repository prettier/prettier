#!/usr/bin/env node

import { exec } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

async function run() {
  const chalk = (await import("chalk")).default;
  const minimist = (await import("minimist")).default;
  const semver = (await import("semver")).default;
  const { string: outdentString } = (await import("outdent")).default;
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
    import("./steps/validate-new-version.js"),
    import("./steps/check-git-status.js"),
    import("./steps/install-dependencies.js"),
    import("./steps/run-tests.js"),
    import("./steps/update-version.js"),
    import("./steps/generate-bundles.js"),
    import("./steps/update-changelog.js"),
    import("./steps/push-to-git.js"),
    import("./steps/publish-to-npm.js"),
    import("./steps/bump-prettier.js"),
    import("./steps/update-dependents-count.js"),
    import("./steps/post-publish-steps.js"),
  ];

  try {
    for await (const { default: step } of steps) {
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
