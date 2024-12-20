import chalk from "chalk";
import outdent from "outdent";
import semver from "semver";
import {
  getBlogPostInfo,
  getChangelogContent,
  waitForEnter,
} from "../utils.js";

const RELEASE_URL_BASE = "https://github.com/prettier/prettier/releases/new?";
export function getReleaseUrl(version, previousVersion) {
  const semverDiff = semver.diff(version, previousVersion);
  const isPatch = semverDiff === "patch";
  let body;
  if (isPatch) {
    const urlToChangelog =
      "https://github.com/prettier/prettier/blob/main/CHANGELOG.md#" +
      version.split(".").join("");
    body = `🔗 [Changelog](${urlToChangelog})`;
  } else {
    const blogPostInfo = getBlogPostInfo(version);
    body = getChangelogContent({
      version,
      previousVersion,
      body: `🔗 [Release note](https://prettier.io/${blogPostInfo.path})`,
    });
  }
  const parameters = new URLSearchParams({
    tag: version,
    title: version,
    body,
  });
  return `${RELEASE_URL_BASE}${parameters}`;
}

export default async function showInstructionsAfterNpmPublish({
  version,
  previousVersion,
  next,
}) {
  if (next) {
    console.log(`${chalk.green.bold(`Prettier ${version} published!`)}`);
    await waitForEnter();
    return;
  }

  const releaseUrl = getReleaseUrl(version, previousVersion);
  console.log(
    outdent`
      ${chalk.green.bold(`Prettier ${version} published!`)}

      ${chalk.yellow.bold("Some manual steps are necessary.")}

      ${chalk.bold.underline("Create a GitHub Release")}
      - Go to ${chalk.cyan.underline(releaseUrl)}
      - Press ${chalk.bgGreen.black("Publish release ")}

      After that, we can proceed to bump this repo's Prettier dependency.
    `,
  );

  await waitForEnter();
}
