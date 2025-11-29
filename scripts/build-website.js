#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import esbuild from "esbuild";
import fastGlob from "fast-glob";
import spawn from "nano-spawn";
import serialize from "serialize-javascript";
import {
  copyFile,
  DIST_DIR,
  PROJECT_ROOT,
  WEBSITE_DIR,
  writeFile,
  writeJson,
} from "./utils/index.js";

const runYarn = (command, args, options) =>
  spawn("yarn", [command, ...args], { stdio: "inherit", ...options });
const IS_PULL_REQUEST = process.env.PULL_REQUEST === "true";
const IS_CI = Boolean(process.env.CI);
const PACKAGES_DIRECTORY = IS_PULL_REQUEST
  ? DIST_DIR
  : url.fileURLToPath(new URL("../node_modules", import.meta.url));
const PLAYGROUND_LIB_DIRECTORY = path.join(WEBSITE_DIR, "static/lib");

async function writeScript(file, code) {
  const { code: minified } = await esbuild.transform(code, {
    loader: "js",
    minify: IS_CI,
  });
  await writeFile(path.join(PLAYGROUND_LIB_DIRECTORY, file), minified.trim());
}

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
    await runYarn("build", ["--clean", "--playground"], {
      cwd: PROJECT_ROOT,
    });
  } finally {
    // restore
    await writeFile(packageJsonFile, packageJsonContent);
  }
}

async function buildPlaygroundFiles() {
  await buildPrettier();

  const prettierEntry = "prettier/standalone.mjs";

  const pluginFiles = [];

  // Builtin plugins
  for (const fileName of await fastGlob(["plugins/*.mjs"], {
    cwd: path.join(PACKAGES_DIRECTORY, "prettier"),
  })) {
    pluginFiles.push(`prettier/${fileName}`);
  }

  for (const pluginName of ["plugin-hermes"]) {
    pluginFiles.push(`${pluginName}/index.mjs`);
  }
  for (const pluginName of ["plugin-oxc"]) {
    pluginFiles.push(`${pluginName}/index.browser.mjs`);
  }

  await Promise.all([
    ...[prettierEntry, ...pluginFiles].map((file) =>
      copyFile(
        path.join(PACKAGES_DIRECTORY, file),
        path.join(PLAYGROUND_LIB_DIRECTORY, file),
      ),
    ),
    writeScript(
      "pull-request-package-data.mjs",
      /* Indent */ `
        export const prettierEntry = ${serialize(prettierEntry, IS_CI ? undefined : { space: 2 })};
        export const pluginFiles = ${serialize(pluginFiles, IS_CI ? undefined : { space: 2 })};
      `,
    ),
  ]);
}

if (IS_PULL_REQUEST) {
  console.log("Preparing packages for playground...");
  await buildPlaygroundFiles();
}

// --- Site ---
console.log("Installing website dependencies...");
await runYarn("install", [], { cwd: WEBSITE_DIR });

console.log("Preparing files for playground...");
await runYarn(
  IS_PULL_REQUEST
    ? "prepare-pull-request-playground"
    : "prepare-stable-playground",
  [],
  { cwd: WEBSITE_DIR },
);

console.log("Building website...");
await runYarn("build", [], { cwd: WEBSITE_DIR });
