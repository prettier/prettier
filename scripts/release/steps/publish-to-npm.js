import chalk from "chalk";
import outdent from "outdent";
import { execa } from "execa";
import semver from "semver";
import enquirer from "enquirer";
import {
  getBlogPostInfo,
  getChangelogContent,
  logPromise,
  waitForEnter,
} from "../utils.js";

const outdentString = outdent.string;

/**
 * Retry "npm publish" when to enter OTP is failed.
 */
async function retryNpmPublish() {
  const runNpmPublish = async () => {
    const { otp } = await enquirer.prompt({
      type: "input",
      name: "otp",
      message: "Please enter your npm OTP",
    });
    await execa("npm", ["publish", "--otp", otp], { cwd: "./dist" });
  };
  for (let i = 5; i > 0; i--) {
    try {
      return await runNpmPublish();
    } catch (error) {
      if (error.code === "EOTP" && i > 0) {
        console.log(`To enter OTP is failed, you can retry it ${i} times.`);
        continue;
      }
      throw error;
    }
  }
}

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

export default async function publishToNpm({ dry, version, previousVersion }) {
  if (dry) {
    return;
  }

  await logPromise("Publishing to npm", retryNpmPublish());

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
