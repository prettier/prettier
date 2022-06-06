import chalk from "chalk";
import outdent from "outdent";
import semver from "semver";
import {
  getBlogPostInfo,
  getChangelogContent,
  waitForEnter,
} from "../utils.js";

const outdentString = outdent.string;

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
  body = encodeURIComponent(body);
  return `https://github.com/prettier/prettier/releases/new?tag=${version}&title=${version}&body=${body}`;
}

export default async function showInstructionsAfterNpmPublish({
  version,
  previousVersion,
}) {
  const releaseUrl = getReleaseUrl(version, previousVersion);

  console.log(
    outdentString(chalk`
      {green.bold Prettier ${version} published!}

      {yellow.bold Some manual steps are necessary.}

      {bold.underline Create a GitHub Release}
      - Go to {cyan.underline ${releaseUrl}}
      - Press {bgGreen.black  Publish release }

      {bold.underline Test the new release}
      - In a new session, run {yellow npm i prettier@latest} in another directory
      - Test the API and CLI

      After that, we can proceed to bump this repo's Prettier dependency.
      Press ENTER to continue.
    `)
  );
  await waitForEnter();
}
