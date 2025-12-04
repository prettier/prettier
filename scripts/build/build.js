#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import styleText from "node-style-text";
import prettyBytes from "pretty-bytes";
import prettyMilliseconds from "pretty-ms";
import { DIST_DIR, PROJECT_ROOT } from "../utilities/index.js";
import packageConfigs from "./packages/index.js";
import parseArguments from "./parse-arguments.js";

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
  const displayName = ` ${file.output}`;
  const fileAbsolutePath = path.join(distDirectory, file.output);

  process.stdout.write(fitTerminal(displayName));

  if (
    (cliOptions.playground && !file.playground) ||
    (cliOptions.files && !cliOptions.files.has(fileAbsolutePath))
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

  if (result?.skipped) {
    console.log(status.SKIPPED);
    return;
  }

  const outputFile = cliOptions.saveAs ?? file.output;

  const sizeMessages = [];
  if (cliOptions.printSize) {
    const { size } = await fs.stat(path.join(distDirectory, outputFile));
    sizeMessages.push(prettyBytes(size));
  }

  if (cliOptions.compareSize) {
    const stablePrettierDirectory = path.join(
      PROJECT_ROOT,
      `node_modules/${packageConfig.packageName}/`,
    );
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

  let packagesToBuild = [];
  if (cliOptions.packages) {
    for (const packageName of cliOptions.packages) {
      const packageConfig = packageConfigs.find(
        (packageConfig) => packageConfig.packageName === packageName,
      );

      if (!packageConfig) {
        throw new Error(`Unknown package "${packageName}"`);
      }

      packagesToBuild.push(packageConfig);
    }
  } else {
    packagesToBuild = packageConfigs;
  }

  // TODO: Clear package dist directory instead
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

  for (const [index, packageConfig] of packagesToBuild.entries()) {
    if (index > 0) {
      console.log();
    }

    console.log(
      styleText.blue`[${index + 1}/${packagesToBuild.length}] Building package '${packageConfig.packageName}'`,
    );

    const startTime = performance.now();
    const results = [];
    for (const module of packageConfig.modules) {
      console.log(styleText.gray(module.name));
      for (const file of module.files) {
        const result = await buildFile({
          packageConfig,
          file,
          cliOptions,
          results,
        });
        results.push(result);
      }
    }
    console.log(
      `Build package '${packageConfig.packageName}' success in ${prettyMilliseconds(performance.now() - startTime)}`,
    );
  }
}

await run();
