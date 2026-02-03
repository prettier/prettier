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
} from "./utilities/index.js";

const runYarn = (command, args, options) =>
  spawn("yarn", [command, ...args], { stdio: "inherit", ...options });

const IS_PULL_REQUEST = process.env.PULL_REQUEST === "true";
const NODE_MODULES_DIR = url.fileURLToPath(
  new URL("../node_modules", import.meta.url),
);

async function writeScript(libDirectory, file, code) {
  const { code: minified } = await esbuild.transform(code, {
    loader: "js",
    minify: true,
  });
  await writeFile(path.join(libDirectory, file), minified.trim());
}

async function buildPlaygroundFiles(
  packagesDirectory,
  libDirectory,
  { includeExternalPlugins = false, version } = {},
) {
  const pluginFiles = [];

  // Builtin plugins
  for (const fileName of await fastGlob(["plugins/*.mjs"], {
    cwd: path.join(packagesDirectory, "prettier"),
  })) {
    pluginFiles.push(`prettier/${fileName}`);
  }

  // TODO: Support stable version
  // External plugins
  if (includeExternalPlugins) {
    for (const pluginName of ["plugin-hermes"]) {
      pluginFiles.push(`${pluginName}/index.mjs`);
    }
    for (const pluginName of ["plugin-oxc"]) {
      pluginFiles.push(`${pluginName}/index.browser.mjs`);
    }
  }

  const packageManifest = {
    version,
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
      libDirectory,
      "package-manifest.mjs",
      `export default ${serialize(packageManifest, { space: 2 })};`,
    ),
  ]);
}

async function getVersion(packagesDirectory) {
  const packageJsonFile = path.join(packagesDirectory, "prettier/package.json");
  const { version } = JSON.parse(await fs.readFile(packageJsonFile, "utf8"));
  return version;
}

async function getGitVersion() {
  const branch = await spawn("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: PROJECT_ROOT,
  })
    .stdout.toString()
    .trim();

  const commit = await spawn("git", ["rev-parse", "--short", "HEAD"], {
    cwd: PROJECT_ROOT,
  })
    .stdout.toString()
    .trim();

  if (!commit) {
    return `${branch}-Uncommited`;
  }

  return `${branch}-${commit}`;
}

// Build lib-stable (from node_modules)
console.log("Preparing files for playground (stable)...");
const stableVersion = await getVersion(NODE_MODULES_DIR);
await buildPlaygroundFiles(
  NODE_MODULES_DIR,
  path.join(WEBSITE_DIR, "static/lib-stable"),
  { version: stableVersion },
);

// Build lib-next (from dist)
console.log("Building prettier...");
await runYarn("build", ["--clean", "--playground"], {
  cwd: PROJECT_ROOT,
});

console.log("Preparing files for playground (next)...");
const nextVersion = IS_PULL_REQUEST
  ? `999.999.999-pr.${process.env.REVIEW_ID}`
  : await getGitVersion();
await buildPlaygroundFiles(
  DIST_DIR,
  path.join(WEBSITE_DIR, "static/lib-next"),
  { includeExternalPlugins: true, version: nextVersion },
);

// --- Site ---
console.log("Installing website dependencies...");
await runYarn("install", [], { cwd: WEBSITE_DIR });

console.log("Building website...");
await runYarn("build", [], { cwd: WEBSITE_DIR });
