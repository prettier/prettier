"use strict";

const chalk = require("chalk");
const bundler = require("./bundler");
const bundleConfigs = require("./config");
const util = require("./util");

// Errors in promises should be fatal.
const loggedErrors = new Set();
process.on("unhandledRejection", err => {
  if (loggedErrors.has(err)) {
    // No need to print it twice.
    process.exit(1);
  }
  throw err;
});

async function createBundle(bundleConfig) {
  const { output } = bundleConfig;
  console.log(`${chalk.bgYellow.black(" BUILDING ")} ${output}`);

  try {
    await bundler(bundleConfig, output);
  } catch (error) {
    console.log(`${chalk.bgRed.black("  FAILED  ")} ${output}\n`);
    handleError(error);
  }

  console.log(`${chalk.bgGreen.black(" COMPLETE ")} ${output}\n`);
}

function handleError(error) {
  loggedErrors.add(error);
  console.error(error);
  throw error;
}

async function preparePackage() {
  const pkg = await util.readJson("package.json");
  pkg.bin = "./bin-prettier.js";
  pkg.engines.node = ">=4";
  delete pkg.dependencies;
  delete pkg.devDependencies;
  pkg.scripts = {
    prepublishOnly:
      "node -e \"assert.equal(require('.').version, require('..').version)\""
  };
  await util.writeJson("dist/package.json", pkg);

  await util.copyFile("./README.md", "./dist/README.md");
}

async function run() {
  await util.asyncRimRaf("dist");

  for (const bundleConfig of bundleConfigs) {
    await createBundle(bundleConfig);
  }

  await preparePackage();
}

run();
