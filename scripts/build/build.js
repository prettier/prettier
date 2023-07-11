#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs/promises";
import readline from "node:readline";
import chalk from "chalk";
import minimist from "minimist";
import prettyBytes from "pretty-bytes";
import createEsmUtils from "esm-utils";
import { DIST_DIR } from "../utils/index.js";
import files from "./config.js";

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

async function buildFile({ file, files, shouldCollectLicenses, cliOptions }) {
  let displayName = file.output.file;
  if (
    (file.platform === "universal" && file.output.format !== "esm") ||
    (file.output.file.startsWith("index.") && file.output.format !== "esm") ||
    file.kind === "types"
  ) {
    displayName = ` ${displayName}`;
  }

  process.stdout.write(fitTerminal(displayName));

  if (
    (cliOptions.files && !cliOptions.files.has(file.output.file)) ||
    (cliOptions.playground &&
      (file.output.format !== "umd" || file.output.file === "doc.js"))
  ) {
    console.log(status.SKIPPED);
    return;
  }

  let result;
  try {
    result = await file.build({
      file,
      files,
      shouldCollectLicenses,
      cliOptions,
    });
  } catch (error) {
    console.log(status.FAIL + "\n");
    console.error(error);
    throw error;
  }

  result ??= {
    file: cliOptions.saveAs ?? file.output.file,
  };

  if (result.skipped) {
    console.log(status.SKIPPED);
    return;
  }

  const sizeMessages = [];
  if (cliOptions.printSize) {
    const { size } = await fs.stat(path.join(DIST_DIR, result.file));
    sizeMessages.push(prettyBytes(size));
  }

  if (cliOptions.compareSize) {
    // TODO: Use `import.meta.resolve` when Node.js support
    const stablePrettierDirectory = path.dirname(require.resolve("prettier"));
    const stableVersionFile = path.join(stablePrettierDirectory, result.file);
    let stableSize;
    try {
      ({ size: stableSize } = await fs.stat(stableVersionFile));
    } catch {
      // No op
    }

    if (stableSize) {
      const { size } = await fs.stat(path.join(DIST_DIR, result.file));
      const sizeDiff = size - stableSize;
      const message = chalk[sizeDiff > 0 ? "yellow" : "green"](
        prettyBytes(sizeDiff),
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
      fitTerminal(displayName, `${sizeMessages.join(", ")} `),
    );
  }

  console.log(status.DONE);
}

async function run(cliOptions) {
  cliOptions.files = cliOptions.file
    ? new Set([cliOptions.file].flat())
    : cliOptions.file;
  delete cliOptions.file;

  cliOptions.saveAs = cliOptions["save-as"];
  delete cliOptions["save-as"];

  cliOptions.printSize = cliOptions["print-size"];
  delete cliOptions["print-size"];

  cliOptions.compareSize = cliOptions["compare-size"];
  delete cliOptions["compare-size"];

  if (cliOptions.report === "") {
    cliOptions.report = ["html"];
  }
  cliOptions.reports = cliOptions.report
    ? [cliOptions.report].flat()
    : cliOptions.report;
  delete cliOptions.report;

  if (cliOptions.saveAs && !(cliOptions.files && cliOptions.files.size === 1)) {
    throw new Error("'--save-as' can only use together with one '--file' flag");
  }

  if (
    cliOptions.saveAs &&
    !path.join(DIST_DIR, cliOptions.saveAs).startsWith(DIST_DIR)
  ) {
    throw new Error("'--save-as' can only relative path");
  }

  if (cliOptions.clean) {
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

  if (cliOptions.compareSize) {
    if (cliOptions.minify === false) {
      throw new Error(
        "'--compare-size' can not use together with '--no-minify' flag",
      );
    }

    if (cliOptions.saveAs) {
      throw new Error(
        "'--compare-size' can not use together with '--save-as' flag",
      );
    }
  }

  const shouldCollectLicenses =
    !cliOptions.playground && !cliOptions.files && cliOptions.minify === null;

  console.log(chalk.inverse(" Building packages "));

  for (const file of files) {
    await buildFile({ file, files, shouldCollectLicenses, cliOptions });
  }
}

await run(
  minimist(process.argv.slice(2), {
    boolean: ["playground", "print-size", "compare-size", "minify", "clean"],
    string: ["file", "save-as", "report"],
    default: {
      clean: false,
      playground: false,
      printSize: false,
      compareSize: false,
      minify: null,
    },
    unknown(flag) {
      throw new Error(`Unknown flag ${chalk.red(flag)}`);
    },
  }),
);
