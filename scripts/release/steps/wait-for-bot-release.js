import chalk from "chalk";
import outdent from "outdent";
import fetch from "node-fetch";
import { waitForEnter, logPromise } from "../utils.js";

const outdentString = outdent.string;

export async function isVersionReleased(version) {
  const response = await fetch("https://registry.npmjs.org/prettier/");
  const result = await response.json();
  const versionExists = version in result.time;

  if (!versionExists) {
    throw new Error(`prettier@${version} doesn't exit.`);
  }

  return versionExists;
}

const sleep = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 30_000);
  });

export default async function waitForBotRelease({ dry, version }) {
  if (dry) {
    return;
  }

  console.log(
    outdentString(chalk`
      1. Go to {green.underline https://github.com/prettier/release-workflow/actions/workflows/release.yml}
      2. Click "{green Run workflow}" button, type "{yellow.underline ${version}}" in "Version to release", uncheck all checkboxes, hit the "{bgGreen Run workflow}" button.

      Press ENTER to continue.
    `)
  );

  await waitForEnter();

  let released = false;
  while (!released) {
    try {
      released = await logPromise(
        "Checking release status",
        isVersionReleased(version)
      );
    } catch {
      // No op
    }

    if (!released) {
      await logPromise("Wait for 30s", sleep());
    }
  }
}
