import fs from "node:fs/promises";
import { execa } from "execa";
import chalk from "chalk";

const PACKAGE_JSON_FILE = new URL("../package.json", import.meta.url);
const shouldFix = process.argv.includes("--fix");

async function checkDependencies(shouldFix) {
  const packageJson = JSON.parse(await fs.readFile(PACKAGE_JSON_FILE));

  let changed = false;

  for (const kind of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
    "resolutions",
  ]) {
    if (!packageJson[kind]) {
      continue;
    }

    for (const [name, version] of Object.entries(packageJson[kind])) {
      if (!(version.startsWith("^") || version.startsWith("~"))) {
        continue;
      }

      if (shouldFix) {
        packageJson[kind][name] = version.slice(1);
        changed = true;
      } else {
        console.error(
          chalk.red("error"),
          `"${chalk.bold.red(name)}" in "${kind}" should be pinned.`,
        );
        process.exitCode = 1;
      }
    }
  }

  if (shouldFix && changed) {
    await fs.writeFile(
      PACKAGE_JSON_FILE,
      JSON.stringify(packageJson, undefined, 2) + "\n",
    );
    await execa("yarn");
    await checkDependencies(/* shouldFix */ false);
  }
}

await checkDependencies(shouldFix);
