"use strict";

const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const execa = require("execa");
const minimist = require("minimist");

const bundler = require("./bundler");
const bundleConfigs = require("./config");
const util = require("./util");
const Cache = require("./cache");

// Errors in promises should be fatal.
const loggedErrors = new Set();
process.on("unhandledRejection", (err) => {
  // No need to print it twice.
  if (!loggedErrors.has(err)) {
    console.error(err);
  }
  process.exit(1);
});

const CACHE_VERSION = "v32"; // This need update when updating build scripts
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

const fitTerminal = (input) => {
  const columns = Math.min(process.stdout.columns || 40, 80);
  const WIDTH = columns - maxLength + 1;
  if (input.length < WIDTH) {
    input += chalk.dim(".").repeat(WIDTH - input.length - 1);
  }
  return input;
};

const createBundle = async (bundleConfig, cache, options) => {
  const { output, target } = bundleConfig;
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

    // Files including U+FFEE can't load in Chrome Extension
    // `prettier-chrome-extension` https://github.com/prettier/prettier-chrome-extension
    // details https://github.com/prettier/prettier/pull/8534
    if (target === "universal") {
      const file = path.join("dist", output);
      const content = fs.readFileSync(file, "utf8");
      if (content.includes("\ufffe")) {
        throw new Error("Bundled umd file should not have U+FFFE character.");
      }
    }

    console.log(status.DONE);
  } catch (error) {
    console.log(status.FAIL + "\n");
    handleError(error);
  }
};

const handleError = (error) => {
  loggedErrors.add(error);
  console.error(error);
  throw error;
};

const cacheFiles = async (cache) => {
  // Copy built files to .cache
  try {
    await execa("rm", ["-rf", path.join(".cache", "files")]);
    await execa("mkdir", ["-p", path.join(".cache", "files")]);
    await execa("mkdir", ["-p", path.join(".cache", "files", "esm")]);
    const manifest = cache.updated;

    for (const file of Object.keys(manifest.files)) {
      await execa("cp", [
        file,
        path.join(".cache", file.replace("dist", "files")),
      ]);
    }
  } catch (err) {
    // Don't fail the build
  }
};

const preparePackage = async () => {
  const pkg = await util.readJson("package.json");
  pkg.bin = "./bin-prettier.js";
  delete pkg.dependencies;
  delete pkg.devDependencies;
  pkg.scripts = {
    prepublishOnly:
      "node -e \"assert.equal(require('.').version, require('..').version)\"",
  };
  pkg.files = ["*.js", "esm/*.mjs"];
  await util.writeJson("dist/package.json", pkg);

  await util.copyFile("./README.md", "./dist/README.md");
  await util.copyFile("./LICENSE", "./dist/LICENSE");
};

const run = async (params) => {
  await execa("rm", ["-rf", "dist"]);
  await execa("mkdir", ["-p", "dist"]);
  if (!params.playground) {
    await execa("mkdir", ["-p", "dist/esm"]);
  }

  if (params["purge-cache"]) {
    await execa("rm", ["-rf", ".cache"]);
  }

  const bundleCache = new Cache(".cache/", CACHE_VERSION);
  await bundleCache.load();

  console.log(chalk.inverse(" Building packages "));
  for (const bundleConfig of bundleConfigs) {
    await createBundle(bundleConfig, bundleCache, params);
  }

  await cacheFiles(bundleCache);
  await bundleCache.save();

  if (!params.playground) {
    await preparePackage();
  }
};

run(
  minimist(process.argv.slice(2), {
    boolean: ["purge-cache", "playground"],
  })
);
