import styleText from "node-style-text";
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
        1. Go to ${styleText.green.underline(
          "https://www.npmjs.com/package/prettier/access",
        )}
        2. Add "${styleText.yellow("prettier-bot")}" as prettier package maintainer.
      `,
    );

    await waitForEnter();
  }

  console.log(
    outdent`
      1. Go to ${styleText.green.underline(
        "https://www.npmjs.com/package/prettier/access",
      )}
      2. Make sure "${styleText.yellow(
        "Publishing access",
      )}" section is set to "${styleText.yellow(
        "Require two-factor authentication or an automation or granular access token",
      )}".
    `,
  );

  await waitForEnter();

  console.log(
    outdent`
      1. Go to ${styleText.green.underline(
        "https://github.com/prettier/release-workflow/actions/workflows/release.yml",
      )}
      2. Click "${styleText.green(
        "Run workflow",
      )}" button, type "${styleText.yellow.underline(
        version,
      )}" in "Version to release", ${
        next ? 'check only "Unstable version"' : "uncheck all checkboxes"
      }, hit the "${styleText.bgGreen("Run workflow")}" button.
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
