import chalk from "chalk";
import semver from "semver";
import { outdent } from "outdent";
import { runGit, readJson } from "./utils.js";
import parseArguments from "./parse-arguments.js";

const importDefault = async (module) => (await import(module)).default;

async function run() {
  const params = parseArguments();

  const { stdout: previousVersion } = await runGit([
    "describe",
    "--tags",
    "--abbrev=0",
  ]);

  if (semver.parse(previousVersion) === null) {
    throw new Error(`Unexpected previousVersion: ${previousVersion}`);
  } else {
    params.previousVersion = previousVersion;
    params.previousVersionOnDefaultBranch = (
      await readJson("package.json")
    ).version;
  }

  const steps = await Promise.all(
    [
      "./steps/validate-new-version.js",
      "./steps/check-git-status.js",
      !params.skipDependenciesInstall && "./steps/install-dependencies.js",
      params.manual && "./steps/run-tests.js",
      "./steps/update-version.js",
      params.manual && "./steps/generate-bundles.js",
      "./steps/update-changelog.js",
      "./steps/push-to-git.js",
      params.manual
        ? "./steps/publish-to-npm.js"
        : "./steps/wait-for-bot-release.js",
      "./steps/show-instructions-after-npm-publish.js",
      "./steps/update-dependents-count.js",
      "./steps/bump-prettier.js",
      "./steps/post-publish-steps.js",
    ]
      .filter(Boolean)
      .map((step) => importDefault(step))
  );

  try {
    for (const step of steps) {
      await step(params);
    }
  } catch (error) {
    const message = outdent.string(error.message.trim());
    const stack = error.stack.replace(message, "");
    console.error(`${chalk.red("error")} ${message}\n${stack}`);
    process.exitCode = 1;
  }
}

export default run;
