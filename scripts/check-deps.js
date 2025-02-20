#!/usr/bin/env node

import fs from "node:fs/promises";
import styleText from "node-style-text";

const PROJECT_ROOT = new URL("../", import.meta.url);

for (const directory of [
  "./",
  "./website/",
  "./scripts/release/",
  "./scripts/tools/bundle-test/",
  "./scripts/tools/eslint-plugin-prettier-internal-rules/",
]) {
  const file = new URL(`${directory}package.json`, PROJECT_ROOT);

  console.log(
    `Checking '${styleText.gray(file.href.slice(PROJECT_ROOT.href.length - 1))}'...`,
  );
  await validatePackageJson(file);
  console.log("done.");
  console.log();
}

async function validatePackageJson(packageJsonFile) {
  const packageJson = JSON.parse(await fs.readFile(packageJsonFile));

  for (const property of ["dependencies", "devDependencies", "resolutions"]) {
    validateDependencyObject(packageJson, property);
  }
}

function validateDependencyObject(packageJson, property) {
  const value = packageJson[property];

  if (!value) {
    return;
  }

  for (const [name, version] of Object.entries(value)) {
    if (version[0] === "^" || version[0] === "~") {
      console.error(
        styleText.bgRed.black(" ERROR "),
        `Dependency "${styleText.bold.blue(name)}" in "${styleText.gray.underline(property)}" should be pinned.`,
      );
      process.exitCode = 1;
    }
  }
}
