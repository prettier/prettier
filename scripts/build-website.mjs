#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs/promises";
import url from "node:url";
import fastGlob from "fast-glob";
import createEsmUtils from "esm-utils";
import { execa } from "execa";
import { format } from "../src/index.js";
import {
  PROJECT_ROOT,
  DIST_DIR,
  WEBSITE_DIR,
  writeJson,
  copyFile,
  writeFile,
} from "./utils/index.mjs";

const { require } = createEsmUtils(import.meta);
const runYarn = (command, args, options) =>
  execa("yarn", [command, ...args], {
    stdout: "inherit",
    stderr: "inherit",
    ...options,
  });
const IS_PULL_REQUEST = process.env.PULL_REQUEST === "true";
const PRETTIER_DIR = IS_PULL_REQUEST
  ? DIST_DIR
  : url.fileURLToPath(new URL("../node_modules/prettier", import.meta.url));
const PLAYGROUND_PRETTIER_DIR = path.join(WEBSITE_DIR, "static/lib");

async function buildPrettier() {
  // --- Build prettier for PR ---
  const packageJsonFile = path.join(PROJECT_ROOT, "package.json");
  const packageJsonContent = await fs.readFile(packageJsonFile);
  const packageJson = JSON.parse(packageJsonContent);
  await writeJson(packageJsonFile, {
    ...packageJson,
    version: `999.999.999-pr.${process.env.REVIEW_ID}`,
  });

  try {
    await runYarn("build", ["--playground", "--clean"], {
      cwd: PROJECT_ROOT,
    });
  } finally {
    // restore
    await writeFile(packageJsonFile, packageJsonContent);
  }
}

async function buildPlaygroundFiles() {
  const patterns = IS_PULL_REQUEST
    ? ["standalone.js", "plugins/*.js"]
    : // TODO: Remove this patterns after we release v3
      ["standalone.js", "parser-*.js"];

  const files = await fastGlob(patterns, {
    cwd: PRETTIER_DIR,
  });

  const parsersLocation = {};
  for (const fileName of files) {
    const file = path.join(PRETTIER_DIR, fileName);
    const dist = path.join(PLAYGROUND_PRETTIER_DIR, fileName);
    await copyFile(file, dist);

    if (fileName === "standalone.js") {
      continue;
    }

    const plugin = require(dist);
    for (const parser of Object.keys(plugin.parsers)) {
      parsersLocation[parser] = fileName;
    }
  }

  await writeFile(
    path.join(PLAYGROUND_PRETTIER_DIR, "parsers-location.js"),
    await format(
      `
        "use strict";

        const parsersLocation = ${JSON.stringify(parsersLocation)};
      `,
      { parser: "babel" }
    )
  );
}

if (IS_PULL_REQUEST) {
  console.log("Building prettier...");
  await buildPrettier();
}

console.log("Preparing files for playground...");
await buildPlaygroundFiles();

// --- Site ---
console.log("Installing website dependencies...");
await runYarn("install", [], { cwd: WEBSITE_DIR });

console.log("Building website...");
await runYarn("build", [], { cwd: WEBSITE_DIR });
