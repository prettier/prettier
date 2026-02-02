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

async function buildPrettier() {
  const packageJsonFile = path.join(PROJECT_ROOT, "package.json");
  const packageJsonContent = await fs.readFile(packageJsonFile);

  if (IS_PULL_REQUEST) {
    const packageJson = JSON.parse(packageJsonContent);
    await writeJson(packageJsonFile, {
      ...packageJson,
      version: `999.999.999-pr.${process.env.REVIEW_ID}`,
    });
  }

  try {
    await runYarn("build", ["--clean", "--playground"], {
      cwd: PROJECT_ROOT,
    });
  } finally {
    if (IS_PULL_REQUEST) {
      await writeFile(packageJsonFile, packageJsonContent);
    }
  }
}

async function buildPlaygroundFiles(
  packagesDirectory,
  libDirectory,
  { includeExternalPlugins = false } = {},
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

// Build lib-stable (from node_modules)
console.log("Preparing files for playground (stable)...");
await buildPlaygroundFiles(
  NODE_MODULES_DIR,
  path.join(WEBSITE_DIR, "static/lib-stable"),
);

// Build lib-next (from dist)
console.log("Building prettier...");
await buildPrettier();

console.log("Preparing files for playground (next)...");
await buildPlaygroundFiles(
  DIST_DIR,
  path.join(WEBSITE_DIR, "static/lib-next"),
  { includeExternalPlugins: true },
);

// --- Site ---
console.log("Installing website dependencies...");
await runYarn("install", [], { cwd: WEBSITE_DIR });

console.log("Building website...");
await runYarn("build", [], { cwd: WEBSITE_DIR });
