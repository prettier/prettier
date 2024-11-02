import chalk from "chalk";
import outdent from "outdent";
import { logPromise, waitForEnter } from "../utils.js";

export async function isVersionReleased(version) {
  const response = await fetch("https://registry.npmjs.org/prettier/");
  const result = await response.json();
  const versionExists = version in result.time;

  if (!versionExists) {
    throw new Error(`prettier@${version} doesn't exit.`);
  }

  return versionExists;
}

async function checkBotPermission() {
  const response = await fetch("https://registry.npmjs.org/prettier/");
  const { maintainers } = await response.json();

  return maintainers.some(({ name }) => name === "prettier-bot");
}

const sleep = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 30_000);
  });

export default async function waitForBotRelease({ dry, version, next }) {
  if (dry) {
    return;
  }

  if (!(await checkBotPermission())) {
    console.log(
      outdent`
        1. Go to ${chalk.green.underline(
          "https://www.npmjs.com/package/prettier/access",
        )}
        2. Add "${chalk.yellow("prettier-bot")}" as prettier package maintainer.
      `,
    );

    await waitForEnter();
  }

  console.log(
    outdent`
      1. Go to ${chalk.green.underline(
        "https://www.npmjs.com/package/prettier/access",
      )}
      2. Make sure "${chalk.yellow(
        "Publishing access",
      )}" section is set to "${chalk.yellow(
        "Require two-factor authentication or automation tokens",
      )}".
    `,
  );

  await waitForEnter();

  console.log(
    outdent`
      1. Go to ${chalk.green.underline(
        "https://github.com/prettier/release-workflow/actions/workflows/release.yml",
      )}
      2. Click "${chalk.green(
        "Run workflow",
      )}" button, type "${chalk.yellow.underline(
        version,
      )}" in "Version to release", ${
        next ? 'check only "Unstable version"' : "uncheck all checkboxes"
      }, hit the "${chalk.bgGreen("Run workflow")}" button.
    `,
  );

  await waitForEnter();

  let released = false;
  while (!released) {
    try {
      released = await logPromise(
        "Checking release status",
        isVersionReleased(version),
      );
    } catch {
      // No op
    }

    if (!released) {
      await logPromise("Wait for 30s", sleep());
    }
  }
}
