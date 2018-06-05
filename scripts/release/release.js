#!/usr/bin/env node

"use strict";

async function run() {
  const chalk = require("chalk");
  const dedent = require("dedent");
  const minimist = require("minimist");

  const { readJson } = require("./utils");

  const params = minimist(process.argv.slice(2), {
    string: ["version"],
    boolean: ["dry"],
    alias: { v: "version" }
  });
  params.previousVersion = (await readJson("package.json")).version;

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
    require("./steps/post-publish-steps")
  ];

  try {
    for (const step of steps) {
      await step(params);
    }
  } catch (error) {
    const message = dedent(error.message.trim());
    const stack = error.stack.replace(message, "");
    console.error(`${chalk.red("error")} ${message}\n${stack}`);
    process.exit(1);
  }
}

// Install script's dependencies before any require
const { exec } = require("child_process");
exec("yarn install", { cwd: __dirname }, error => {
  if (error) {
    console.error(error);
    process.exit(1);
  } else {
    run();
  }
});
