#!/usr/bin/env node

import assert from "node:assert/strict";
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
} from "./utilities/index.js";

const runYarn = (command, args, options) =>
  spawn("yarn", [command, ...args], { stdio: "inherit", ...options });

const IS_PULL_REQUEST = process.env.PULL_REQUEST === "true";
const NODE_MODULES_DIR = url.fileURLToPath(
  new URL("../node_modules", import.meta.url),
);

async function writeScript(file, code) {
  const { code: minified } = await esbuild.transform(code, {
    loader: "js",
    minify: true,
  });
  await writeFile(file, minified.trim());
}

/** @param {"stable" | "next"} version */
async function buildPlaygroundFiles(version) {
  assert.ok(version === "stable" || version === "next");

  let packagesDirectory;
  const versionData = { name: version };
  const libDirectory = path.join(WEBSITE_DIR, `static/lib/${version}/`);

  if (version === "stable") {
    packagesDirectory = NODE_MODULES_DIR;
    const { version: prettierVersion } = await import(
      url.pathToFileURL(path.join(packagesDirectory, "prettier/standalone.mjs"))
    );
    versionData.version = prettierVersion;
  }

  if (version === "next") {
    packagesDirectory = DIST_DIR;
    versionData.gitTree = await getGitTreeInformation();
    if (IS_PULL_REQUEST) {
      versionData.pr = process.env.REVIEW_ID;
    }
  }

  const pluginFiles = [];

  // Builtin plugins
  for (const fileName of await fastGlob(["plugins/*.mjs"], {
    cwd: path.join(packagesDirectory, "prettier"),
  })) {
    pluginFiles.push(`prettier/${fileName}`);
  }

  // TODO: Support stable version
  // External plugins
  if (version === "next") {
    for (const pluginName of ["plugin-hermes"]) {
      pluginFiles.push(`${pluginName}/index.mjs`);
    }
    for (const pluginName of ["plugin-oxc"]) {
      pluginFiles.push(`${pluginName}/index.browser.mjs`);
    }
  }

  const packageManifest = {
    version: versionData,
    prettier: {
      file: "prettier/standalone.mjs",
    },
    plugins: await Promise.all(
      pluginFiles.map(async (file) => {
        const plugin = { file };

        const pluginModule = await import(
          url.pathToFileURL(path.join(packagesDirectory, file))
        );

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

        return plugin;
      }),
    ),
  };

  await Promise.all([
    ...[packageManifest.prettier, ...packageManifest.plugins].map(({ file }) =>
      copyFile(
        path.join(packagesDirectory, file),
        path.join(libDirectory, file),
      ),
    ),
    writeScript(
      path.join(libDirectory, "package-manifest.mjs"),
      `export default ${serialize(packageManifest, { space: 2 })};`,
    ),
  ]);
}

async function getGitTreeInformation() {
  const { stdout: branch } = await spawn("git", [
    "rev-parse",
    "--abbrev-ref",
    "HEAD",
  ]);

  const { stdout: diff } = await spawn("git", ["diff", "--name-only"]);

  if (diff) {
    return { branch };
  }

  const { stdout: commit } = await spawn("git", [
    "rev-parse",
    "--short",
    "HEAD",
  ]);
  return { branch, commit };
}

console.log("Building prettier...");
await runYarn("build", ["--clean", "--playground"], { cwd: PROJECT_ROOT });

console.log("Preparing files for playground (stable)...");
await buildPlaygroundFiles("stable");

console.log("Preparing files for playground (next)...");
await buildPlaygroundFiles("next");

// --- Site ---
console.log("Installing website dependencies...");
await runYarn("install", [], { cwd: WEBSITE_DIR });

console.log("Building website...");
await runYarn("build", [], { cwd: WEBSITE_DIR });
