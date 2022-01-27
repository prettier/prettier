#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs/promises";
import readline from "node:readline";
import chalk from "chalk";
import minimist from "minimist";
import prettyBytes from "pretty-bytes";
import rimraf from "rimraf";
import {
  PROJECT_ROOT,
  DIST_DIR,
  readJson,
  writeJson,
  copyFile,
} from "../utils/index.mjs";
import bundler from "./bundler.mjs";
import bundleConfigs from "./config.mjs";
import saveLicenses from "./save-licenses.mjs";

// Errors in promises should be fatal.
const loggedErrors = new Set();
process.on("unhandledRejection", (err) => {
  // No need to print it twice.
  if (!loggedErrors.has(err)) {
    console.error(err);
  }
  process.exit(1);
});

const statusConfig = [
  { color: "bgGreen", text: "DONE" },
  { color: "bgRed", text: "FAIL" },
  { color: "bgGray", text: "SKIPPED" },
];
const maxLength = Math.max(...statusConfig.map(({ text }) => text.length)) + 2;
const padStatusText = (text) => {
  while (text.length < maxLength) {
    text = text.length % 2 ? `${text} ` : ` ${text}`;
  }
  return text;
};
const status = {};
for (const { color, text } of statusConfig) {
  status[text] = chalk[color].black(padStatusText(text));
}

function fitTerminal(input, suffix = "") {
  const columns = Math.min(process.stdout.columns || 40, 80);
  const WIDTH = columns - maxLength + 1;
  if (input.length < WIDTH) {
    const repeatCount = WIDTH - input.length - 1 - suffix.length;
    input += chalk.dim(".").repeat(repeatCount) + suffix;
  }
  return input;
}

const clear = () => {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0, null);
};

async function createBundle(bundleConfig, options) {
  const { target } = bundleConfig;

  try {
    for await (const { name, started, skipped, file } of bundler(
      bundleConfig,
      options
    )) {
      const displayName = name.startsWith("esm/") ? `  ${name}` : name;

      if (started) {
        process.stdout.write(fitTerminal(displayName));
        continue;
      }

      if (skipped) {
        if (!options.files) {
          process.stdout.write(fitTerminal(displayName));
          console.log(status.SKIPPED);
        }

        continue;
      }

      // Files including U+FFEE can't load in Chrome Extension
      // `prettier-chrome-extension` https://github.com/prettier/prettier-chrome-extension
      // details https://github.com/prettier/prettier/pull/8534
      if (target === "universal") {
        const content = await fs.readFile(file, "utf8");
        if (content.includes("\ufffe")) {
          throw new Error("Bundled umd file should not have U+FFFE character.");
        }
      }

      if (options.printSize) {
        // Clear previous line
        clear();

        const size = prettyBytes((await fs.stat(file)).size);
        process.stdout.write(fitTerminal(displayName, `${size} `));
      }

      console.log(status.DONE);
    }
  } catch (error) {
    console.log(status.FAIL + "\n");
    handleError(error);
  }
}

function handleError(error) {
  loggedErrors.add(error);
  console.error(error);
  throw error;
}

async function preparePackage() {
  const packageJson = await readJson(path.join(PROJECT_ROOT, "package.json"));
  packageJson.bin = "./bin-prettier.js";
  packageJson.engines.node = ">=10.13.0";
  delete packageJson.dependencies;
  delete packageJson.devDependencies;
  delete packageJson.browserslist;
  packageJson.scripts = {
    prepublishOnly:
      "node -e \"assert.equal(require('.').version, require('..').version)\"",
  };
  packageJson.files = ["*.js", "esm/*.mjs"];
  await writeJson(path.join(DIST_DIR, "package.json"), packageJson);

  for (const file of ["README.md", "LICENSE"]) {
    await copyFile(path.join(PROJECT_ROOT, file), path.join(DIST_DIR, file));
  }
}

async function run(params) {
  params.files = params.file ? new Set([params.file].flat()) : params.file;
  params.saveAs = params["save-as"];
  params.printSize = params["print-size"];

  if (params.report === "") {
    params.report = ["html"];
  }
  params.reports = params.report ? [params.report].flat() : params.report;

  delete params.file;
  delete params.report;
  delete params["save-as"];
  delete params["print-size"];

  if (params.saveAs && !(params.files && params.files.size === 1)) {
    throw new Error("'--save-as' can only use together with one '--file' flag");
  }

  if (
    params.saveAs &&
    !path.join(DIST_DIR, params.saveAs).startsWith(DIST_DIR)
  ) {
    throw new Error("'--save-as' can only relative path");
  }

  const shouldPreparePackage =
    !params.playground && !params.files && params.minify === null;
  const shouldSaveBundledPackagesLicenses = shouldPreparePackage;

  if (shouldPreparePackage) {
    rimraf.sync(DIST_DIR);
  }

  const licenses = [];
  if (shouldSaveBundledPackagesLicenses) {
    params.onLicenseFound = (dependencies) => licenses.push(...dependencies);
  }

  console.log(chalk.inverse(" Building packages "));

  for (const bundleConfig of bundleConfigs) {
    await createBundle(bundleConfig, params);
  }

  if (shouldPreparePackage) {
    await preparePackage();
  }

  if (shouldSaveBundledPackagesLicenses) {
    await saveLicenses(licenses.filter(({ name }) => name !== "prettier"));
  } else {
    console.warn(
      chalk.red("Bundled packages licenses not included in `dist/LICENSE`.")
    );
  }
}

run(
  minimist(process.argv.slice(2), {
    boolean: ["playground", "print-size", "minify", "babel"],
    string: ["file", "save-as", "report"],
    default: {
      playground: false,
      printSize: false,
      minify: null,
      babel: true,
    },
    unknown(flag) {
      throw new Error(`Unknown flag ${chalk.red(flag)}`);
    },
  })
);
