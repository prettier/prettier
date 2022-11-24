import chalk from "chalk";
import { runYarn, logPromise, readJson } from "../utils.js";

export default async function generateBundles({ version }) {
  await logPromise(
    "Generating bundles",
    runYarn(["build", "--clean", "--print-size", "--compare-size"])
  );

  const builtPkg = await readJson("dist/package.json");
  if (builtPkg.version !== version) {
    throw new Error(
      `Expected ${version} in dist/package.json but found ${builtPkg.version}`
    );
  }

  await logPromise("Running tests on generated bundles", runYarn("test:dist"));

  console.log(chalk.green.bold("Build successful!\n"));
}
