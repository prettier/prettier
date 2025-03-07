#!/usr/bin/env node

import fs from "node:fs/promises";
import styleText from "node-style-text";

const PROJECT_ROOT = new URL("../", import.meta.url);
const ERROR = styleText.bgRed.black(" ERROR ");
const PASS = "✅ All dependency versions are pinned.";

for (const [index, directory] of [
  "./",
  "./website/",
  "./scripts/release/",
  "./scripts/tools/bundle-test/",
  "./scripts/tools/eslint-plugin-prettier-internal-rules/",
].entries()) {
  const file = new URL(`${directory}package.json`, PROJECT_ROOT);

  if (index > 0) {
    console.log();
  }

  console.log(
    `Checking '${styleText.gray(file.href.slice(PROJECT_ROOT.href.length - 1))}'...`,
  );
  const ok = await validatePackageJson(file);
  if (ok) {
    console.log(PASS);
  }
}

async function validatePackageJson(packageJsonFile) {
  const packageJson = JSON.parse(await fs.readFile(packageJsonFile));

  let ok = true;
  for (const property of ["dependencies", "devDependencies", "resolutions"]) {
    const value = packageJson[property];

    if (!value) {
      continue;
    }

    for (const [name, version] of Object.entries(value)) {
      if (version[0] === "^" || version[0] === "~") {
        console.error(
          ERROR,
          `Dependency "${styleText.bold.blue(name)}" in "${styleText.gray.underline(property)}" should be pinned.`,
        );

        ok = false;
        process.exitCode = 1;
      }
    }
  }

  return ok;
}
