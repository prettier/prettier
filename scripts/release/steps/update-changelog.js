"use strict";

const fs = require("fs");
const execa = require("execa");
const chalk = require("chalk");
const { outdent, string: outdentString } = require("outdent");
const semver = require("semver");
const { waitForEnter, runYarn, logPromise } = require("../utils");

function getBlogPostInfo(version) {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return {
    file: `website/blog/${year}-${month}-${day}-${version}.md`,
    path: `blog/${year}/${month}/${day}/${version}.html`,
  };
}

function writeChangelog({ version, previousVersion, body }) {
  const changelog = fs.readFileSync("CHANGELOG.md", "utf-8");
  const newEntry = outdent`
    # ${version}

    [diff](https://github.com/prettier/prettier/compare/${previousVersion}...${version})

    ${body}
  `;
  fs.writeFileSync("CHANGELOG.md", newEntry + "\n\n" + changelog);
}

async function getChangelogForPatch({ version, previousVersion }) {
  const { stdout: changelog } = await execa("node", [
    "scripts/changelog-for-patch.mjs",
    "--prev-version",
    previousVersion,
    "--new-version",
    version,
  ]);
  return changelog;
}

module.exports = async function ({ version, previousVersion }) {
  const semverDiff = semver.diff(version, previousVersion);

  if (semverDiff !== "patch") {
    const blogPost = getBlogPostInfo(version);
    writeChangelog({
      version,
      previousVersion,
      body: `🔗 [Release Notes](https://prettier.io/${blogPost.path})`,
    });
    if (fs.existsSync(blogPost.file)) {
      // Everything is fine, this step is finished
      return;
    }
    console.warn(
      outdentString(chalk`
        {yellow warning} The file {bold ${blogPost.file}} doesn't exist, but it will be referenced in {bold CHANGELOG.md}. Make sure to create it later.

        Press ENTER to continue.
      `)
    );
  } else {
    const body = await getChangelogForPatch({
      version,
      previousVersion,
    });
    writeChangelog({
      version,
      previousVersion,
      body,
    });
    console.log("Press ENTER to continue.");
  }

  await waitForEnter();
  await logPromise(
    "Re-running Prettier on docs",
    runYarn(["lint:prettier", "--write"])
  );
};
