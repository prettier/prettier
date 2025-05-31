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
const PRETTIER_DIR = IS_PULL_REQUEST
  ? path.join(DIST_DIR, "prettier")
  : url.fileURLToPath(new URL("../node_modules/prettier", import.meta.url));
const PLAYGROUND_PRETTIER_DIR = path.join(WEBSITE_DIR, "static/lib");

async function writeScript(file, code) {
  const { code: minified } = await esbuild.transform(code, {
    loader: "js",
    minify: true,
  });
  await writeFile(path.join(PLAYGROUND_PRETTIER_DIR, file), minified.trim());
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
  const patterns = ["standalone.mjs", "plugins/*.mjs"];

  let files = await fastGlob(patterns, {
    cwd: PRETTIER_DIR,
  });

  files = files.map((fileName) => ({
    fileName,
    file: path.join(PRETTIER_DIR, fileName),
    dist: path.join(PLAYGROUND_PRETTIER_DIR, fileName),
  }));

  // TODO: Support stable version
  if (IS_PULL_REQUEST) {
    const fileName = "plugins/hermes.mjs";
    files.push({
      fileName,
      file: path.join(DIST_DIR, "plugin-hermes/index.mjs"),
      dist: path.join(PLAYGROUND_PRETTIER_DIR, fileName),
    });
  }

  const packageManifest = {
    builtinPlugins: [],
  };
  for (const { fileName, file, dist } of files) {
    await copyFile(file, dist);

    if (fileName === "standalone.mjs") {
      continue;
    }

    const pluginModule = await import(url.pathToFileURL(dist));

    const plugin = {
      name: path.basename(fileName, ".js"),
      file: fileName,
    };

    for (const property of ["languages", "options", "defaultOptions"]) {
      const value = pluginModule[property];
      if (value !== undefined) {
        plugin[property] = value;
      }
    }

    for (const property of ["parsers", "printers"]) {
      const value = pluginModule[property];
      if (value !== undefined) {
        plugin[property] = Object.keys(value);
      }
    }

    packageManifest.builtinPlugins.push(plugin);
  }

  const serialized = serialize(packageManifest, { space: 2 });

  await Promise.all([
    writeScript("package-manifest.mjs", `export default ${serialized};`),
    writeScript(
      "package-manifest.js",
      /* Indent */ `
        "use strict";

        self.prettierPackageManifest = ${serialized};
      `,
    ),
  ]);
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
