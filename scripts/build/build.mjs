#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs/promises";
import readline from "node:readline";
import chalk from "chalk";
import minimist from "minimist";
import prettyBytes from "pretty-bytes";
import createEsmUtils from "esm-utils";
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

const { require } = createEsmUtils(import.meta);

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
    const repeatCount = Math.max(WIDTH - input.length - 1 - suffix.length, 0);
    input += chalk.dim(".").repeat(repeatCount) + suffix;
  }
  return input;
}

const clear = () => {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0, null);
};

async function createBundle(bundleConfig, options) {
  try {
    for await (const {
      name,
      started,
      skipped,
      relativePath,
      absolutePath,
    } of bundler(bundleConfig, options)) {
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

      const sizeMessages = [];

      if (options.printSize) {
        const { size } = await fs.stat(absolutePath);
        sizeMessages.push(prettyBytes(size));
      }

      if (options.compareSize) {
        // TODO: Use `import.meta.resolve` when Node.js support
        const stablePrettierDirectory = path.dirname(
          require.resolve("prettier")
        );
        const stableVersionFile = path.join(
          stablePrettierDirectory,
          relativePath
        );
        let stableSize;
        try {
          ({ size: stableSize } = await fs.stat(stableVersionFile));
        } catch {
          // No op
        }

        if (stableSize) {
          const { size } = await fs.stat(absolutePath);
          const sizeDiff = size - stableSize;
          const message = chalk[sizeDiff > 0 ? "yellow" : "green"](
            prettyBytes(sizeDiff)
          );

          sizeMessages.push(`${message}`);
        } else {
          sizeMessages.push(chalk.blue("[NEW FILE]"));
        }
      }

      if (sizeMessages.length > 0) {
        // Clear previous line
        clear();
        process.stdout.write(
          fitTerminal(displayName, `${sizeMessages.join(", ")} `)
        );
      }

      console.log(status.DONE);
    }
  } catch (error) {
    console.log(status.FAIL + "\n");
    console.error(error);
    throw error;
  }
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
  delete params.file;

  params.saveAs = params["save-as"];
  delete params["save-as"];

  params.printSize = params["print-size"];
  delete params["print-size"];

  params.compareSize = params["compare-size"];
  delete params["compare-size"];

  if (params.report === "") {
    params.report = ["html"];
  }
  params.reports = params.report ? [params.report].flat() : params.report;
  delete params.report;

  if (params.saveAs && !(params.files && params.files.size === 1)) {
    throw new Error("'--save-as' can only use together with one '--file' flag");
  }

  if (
    params.saveAs &&
    !path.join(DIST_DIR, params.saveAs).startsWith(DIST_DIR)
  ) {
    throw new Error("'--save-as' can only relative path");
  }

  if (params.clean) {
    let stat;
    try {
      stat = await fs.stat(DIST_DIR);
    } catch {
      // No op
    }

    if (stat) {
      if (stat.isDirectory()) {
        await fs.rm(DIST_DIR, { recursive: true, force: true });
      } else {
        throw new Error(`"${DIST_DIR}" is not a directory`);
      }
    }
  }

  if (params.compareSize) {
    if (params.minify === false) {
      throw new Error(
        "'--compare-size' can not use together with '--no-minify' flag"
      );
    }

    if (params.saveAs) {
      throw new Error(
        "'--compare-size' can not use together with '--save-as' flag"
      );
    }
  }

  const shouldPreparePackage =
    !params.playground && !params.files && params.minify === null;
  const shouldSaveBundledPackagesLicenses = shouldPreparePackage;

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
    const vendorMeta = await readJson(
      new URL("../vendors/vendor-meta.json", import.meta.url)
    );
    licenses.push(...vendorMeta.licenses);

    await saveLicenses(licenses.filter(({ name }) => name !== "prettier"));
  } else {
    console.warn(
      chalk.red("Bundled packages licenses not included in `dist/LICENSE`.")
    );
  }
}

await run(
  minimist(process.argv.slice(2), {
    boolean: [
      "playground",
      "print-size",
      "compare-size",
      "minify",
      "babel",
      "clean",
    ],
    string: ["file", "save-as", "report"],
    default: {
      clean: false,
      playground: false,
      printSize: false,
      compareSize: false,
      minify: null,
      babel: true,
    },
    unknown(flag) {
      throw new Error(`Unknown flag ${chalk.red(flag)}`);
    },
  })
);
