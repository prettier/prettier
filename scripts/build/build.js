#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import createEsmUtils from "esm-utils";
import styleText from "node-style-text";
import prettyBytes from "pretty-bytes";
import { DIST_DIR } from "../utils/index.js";
import packageConfig from "./config.js";
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
  status[text] = styleText[color].black(padStatusText(text));
}

function fitTerminal(input, suffix = "") {
  const columns = Math.min(process.stdout.columns || 40, 80);
  const WIDTH = columns - maxLength + 1;
  if (input.length < WIDTH) {
    const repeatCount = Math.max(WIDTH - input.length - 1 - suffix.length, 0);
    input += styleText.dim(".").repeat(repeatCount) + suffix;
  }
  return input;
}

const clear = () => {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0, null);
};

async function buildFile({ packageConfig, file, cliOptions, results }) {
  const { distDirectory } = packageConfig;
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
      (file.output.format !== "esm" ||
        file.platform !== "universal" ||
        file.output.file === "doc.mjs"))
  ) {
    console.log(status.SKIPPED);
    return;
  }

  let result;
  try {
    result = await file.build({ packageConfig, file, cliOptions, results });
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
    const { size } = await fs.stat(path.join(distDirectory, outputFile));
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
      const { size } = await fs.stat(path.join(distDirectory, outputFile));
      const sizeDiff = size - stableSize;
      const message = styleText[sizeDiff > 0 ? "yellow" : "green"](
        prettyBytes(sizeDiff),
      );

      sizeMessages.push(`${message}`);
    } else {
      sizeMessages.push(styleText.blue("[NEW FILE]"));
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

  console.log(styleText.inverse(" Building packages "));

  const results = [];
  for (const file of packageConfig.files) {
    const result = await buildFile({
      packageConfig,
      file,
      cliOptions,
      results,
    });
    results.push(result);
  }
}

await run();
