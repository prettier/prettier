import styleText from "node-style-text";
import { logPromise, readJson, runYarn } from "../utils.js";

export default async function generateBundles({ dry, version, manual }) {
  if (!manual) {
    return;
  }

  await logPromise(
    "Generating bundles",
    runYarn(["build", "--clean", "--print-size", "--compare-size"]),
  );

  const builtPkg = await readJson("dist/package.json");
  if (!dry && builtPkg.version !== version) {
    throw new Error(
      `Expected ${version} in dist/package.json but found ${builtPkg.version}`,
    );
  }

  await logPromise(
    "Running tests on generated bundles",
    () => runYarn("test:dist"),
    /* shouldSkip */ dry,
  );

  console.log(styleText.green.bold("Build successful!\n"));
}
