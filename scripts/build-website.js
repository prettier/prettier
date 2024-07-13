#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import createEsmUtils from "esm-utils";
import { execa } from "execa";
import fastGlob from "fast-glob";
import { format } from "../src/index.js";
import {
  copyFile,
  DIST_DIR,
  PROJECT_ROOT,
  WEBSITE_DIR,
  writeFile,
  writeJson,
} from "./utils/index.js";

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
  const patterns = ["standalone.js", "plugins/*.js"];

  const files = await fastGlob(patterns, {
    cwd: PRETTIER_DIR,
  });

  const packageManifest = {
    builtinPlugins: [],
  };
  for (const fileName of files) {
    const file = path.join(PRETTIER_DIR, fileName);
    const dist = path.join(PLAYGROUND_PRETTIER_DIR, fileName);
    await copyFile(file, dist);

    if (fileName === "standalone.js") {
      continue;
    }

    const pluginModule = require(dist);
    const plugin = pluginModule.default ?? pluginModule;
    const { parsers = {}, printers = {} } = plugin;
    packageManifest.builtinPlugins.push({
      file: fileName,
      parsers: Object.keys(parsers),
      printers: Object.keys(printers),
    });
  }

  await writeFile(
    path.join(PLAYGROUND_PRETTIER_DIR, "package-manifest.js"),
    await format(
      /* Indent */ `
        "use strict";

        const prettierPackageManifest = ${JSON.stringify(packageManifest)};
      `,
      { parser: "meriyah" },
    ),
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

if (IS_PULL_REQUEST) {
  console.log("Synchronizing docs...");
  process.env.PRETTIER_VERSION = `999.999.999-pr.${process.env.REVIEW_ID}`;
  await runYarn("update-stable-docs", [], { cwd: WEBSITE_DIR });
}

console.log("Building website...");
await runYarn("build", [], { cwd: WEBSITE_DIR });
