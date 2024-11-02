#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import chalk from "chalk";
import createEsmUtils from "esm-utils";
import prettyBytes from "pretty-bytes";
import { DIST_DIR } from "../utils/index.js";
import files from "./config.js";
import parseArguments from "./parse-arguments.js";

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

async function buildFile({ file, files, cliOptions, results }) {
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
    result = await file.build({ file, files, cliOptions, results });
  } catch (error) {
    console.log(status.FAIL + "\n");
    console.error(error);
    throw error;
  }

  result ??= {};

  if (result.skipped) {
    console.log(status.SKIPPED);
    return;
  }

  const outputFile = cliOptions.saveAs ?? file.output.file;

  const sizeMessages = [];
  if (cliOptions.printSize) {
    const { size } = await fs.stat(path.join(DIST_DIR, outputFile));
    sizeMessages.push(prettyBytes(size));
  }

  if (cliOptions.compareSize) {
    // TODO: Use `import.meta.resolve` when Node.js support
    const stablePrettierDirectory = path.dirname(require.resolve("prettier"));
    const stableVersionFile = path.join(stablePrettierDirectory, outputFile);
    let stableSize;
    try {
      ({ size: stableSize } = await fs.stat(stableVersionFile));
    } catch {
      // No op
    }

    if (stableSize) {
      const { size } = await fs.stat(path.join(DIST_DIR, outputFile));
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

  return result;
}

async function run() {
  const cliOptions = parseArguments();

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

  console.log(chalk.inverse(" Building packages "));

  const results = [];
  for (const file of files) {
    const result = await buildFile({ file, files, cliOptions, results });
    results.push(result);
  }
}

await run();
