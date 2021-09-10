#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs/promises";
import globby from "globby";
import prettier from "prettier";
import createEsmUtils from "esm-utils";
import execa from "execa";
import {
  PROJECT_ROOT,
  DIST_DIR,
  WEBSITE_DIR,
  readJson,
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
const PRETTIER_PATH = IS_PULL_REQUEST
  ? DIST_DIR
  : path.dirname(require.resolve("prettier"));
const PLAYGROUND_PRETTIER_DIR = path.join(WEBSITE_DIR, "static/lib");

async function buildPrettier() {
  // --- Build prettier for PR ---
  const packageJsonFile = path.join(PROJECT_ROOT, "package.json");
  const content = await fs.readFile(packageJsonFile);
  const packageJson = await readJson(packageJsonFile);
  await writeJson(packageJsonFile, {
    ...packageJson,
    version: `999.999.999-pr.${process.env.REVIEW_ID}`,
  });

  try {
    await runYarn("build", ["--playground"], { cwd: PROJECT_ROOT });
  } finally {
    // restore
    await writeFile(packageJsonFile, content);
  }
}

async function buildPlaygroundFiles() {
  const files = await globby(["standalone.js", "parser-*.js"], {
    cwd: PRETTIER_PATH,
  });
  const parsers = {};
  for (const fileName of files) {
    const file = path.join(PRETTIER_PATH, fileName);
    await copyFile(file, path.join(PLAYGROUND_PRETTIER_DIR, fileName));

    if (fileName === "standalone.js") {
      continue;
    }

    const plugin = require(file);
    // We add plugins to the global `prettierPlugins` object
    // the file name after `parser-` is used ad property
    // See `scripts/build/config.mjs`
    const property = fileName.replace(/\.js$/, "").split("-")[1];
    parsers[fileName] = {
      property,
      parsers: Object.keys(plugin.parsers),
    };
  }

  await writeFile(
    path.join(PLAYGROUND_PRETTIER_DIR, "parsers-location.js"),
    prettier.format(
      `
        "use strict";

        const parsersLocation = ${JSON.stringify(parsers)};
      `,
      { parser: "babel" }
    )
  );
}

(async () => {
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
})();
