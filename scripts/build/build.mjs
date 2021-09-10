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
  CACHE_DIR,
  DIST_DIR,
  readJson,
  writeJson,
  copyFile,
} from "../utils/index.mjs";
import bundler from "./bundler.mjs";
import bundleConfigs from "./config.mjs";
import Cache from "./cache.mjs";

// Errors in promises should be fatal.
const loggedErrors = new Set();
process.on("unhandledRejection", (err) => {
  // No need to print it twice.
  if (!loggedErrors.has(err)) {
    console.error(err);
  }
  process.exit(1);
});

const CACHE_VERSION = "v38"; // This need update when updating build scripts
const statusConfig = [
  { color: "bgYellow", text: "CACHED" },
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

async function createBundle(bundleConfig, cache, options) {
  const { output, target, format, type } = bundleConfig;
  process.stdout.write(fitTerminal(output));
  try {
    const { cached, skipped } = await bundler(bundleConfig, cache, options);

    if (skipped) {
      console.log(status.SKIPPED);
      return;
    }

    if (cached) {
      console.log(status.CACHED);
      return;
    }

    const file = path.join(DIST_DIR, output);

    // Files including U+FFEE can't load in Chrome Extension
    // `prettier-chrome-extension` https://github.com/prettier/prettier-chrome-extension
    // details https://github.com/prettier/prettier/pull/8534
    if (target === "universal") {
      const content = await fs.readFile(file, "utf8");
      if (content.includes("\ufffe")) {
        throw new Error("Bundled umd file should not have U+FFFE character.");
      }
    }

    if (options["print-size"]) {
      // Clear previous line
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0, null);

      const getSizeText = async (file) =>
        prettyBytes((await fs.stat(file)).size);
      const sizeTexts = [await getSizeText(file)];
      if (
        type !== "core" &&
        format !== "esm" &&
        bundleConfig.bundler !== "webpack" &&
        target === "universal"
      ) {
        const esmFile = path.join(
          DIST_DIR,
          "esm",
          output.replace(".js", ".mjs")
        );
        sizeTexts.push(`esm ${await getSizeText(esmFile)}`);
      }
      process.stdout.write(fitTerminal(output, `${sizeTexts.join(", ")} `));
    }

    console.log(status.DONE);
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
  const shouldUseCache = !params.file && !params["purge-cache"];
  const shouldPreparePackage = !params.playground && !params.file;
  let configs = bundleConfigs;
  if (params.file) {
    configs = configs.filter(({ output }) => output === params.file);
  } else {
    rimraf.sync(DIST_DIR);
  }

  if (params["purge-cache"]) {
    rimraf.sync(CACHE_DIR);
  }

  let bundleCache;
  if (shouldUseCache) {
    bundleCache = new Cache({
      cacheDir: CACHE_DIR,
      distDir: DIST_DIR,
      version: CACHE_VERSION,
    });
    await bundleCache.load();
  }

  console.log(chalk.inverse(" Building packages "));

  for (const bundleConfig of configs) {
    await createBundle(bundleConfig, bundleCache, params);
  }

  if (shouldUseCache) {
    await bundleCache.save();
  }

  if (shouldPreparePackage) {
    await preparePackage();
  }
}

run(
  minimist(process.argv.slice(2), {
    boolean: ["purge-cache", "playground", "print-size"],
    string: ["file"],
  })
);
