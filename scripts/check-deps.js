import fs from "node:fs/promises";
import { execa } from "execa";
import chalk from "chalk";

const PACKAGE_JSON_FILE = new URL("../package.json", import.meta.url);
const DEPENDENCY_KINDS = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
  "resolutions",
];

const isPinnedVersion = (version) =>
  !(version.startsWith("^") || version.startsWith("~"));

function* getUnpinnedDependencies(packageJson) {
  for (const kind of DEPENDENCY_KINDS) {
    for (const [name, version] of Object.entries(packageJson[kind] ?? {})) {
      if (!isPinnedVersion(version)) {
        yield { kind, name, version };
      }
    }
  }
}

async function fixDependencies() {
  const packageJson = JSON.parse(await fs.readFile(PACKAGE_JSON_FILE));

  let changed = false;

  for (const { kind, name, version } of getUnpinnedDependencies(packageJson)) {
    packageJson[kind][name] = version.slice(1);
    changed = true;
  }

  if (changed) {
    await fs.writeFile(
      PACKAGE_JSON_FILE,
      JSON.stringify(packageJson, undefined, 2) + "\n",
    );
    await execa("yarn");
    await checkDependencies(/* shouldFix */ false);
  }
}

async function checkDependencies() {
  const packageJson = JSON.parse(await fs.readFile(PACKAGE_JSON_FILE));

  for (const { kind, name } of getUnpinnedDependencies(packageJson)) {
    console.error(
      chalk.red("error"),
      `"${chalk.bold.red(name)}" in "${kind}" should be pinned.`,
    );
    process.exitCode = 1;
  }
}

if (process.argv.includes("--fix")) {
  await fixDependencies();
}

await checkDependencies();
