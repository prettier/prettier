"use strict";

const chalk = require("chalk");
const dedent = require("dedent");
const execa = require("execa");
const fs = require("fs");
const semver = require("semver");
const { waitForEnter } = require("../utils");

function getBlogPostInfo(version) {
  const date = new Date();
  const year = date.getFullYear();
  const month = new String(date.getMonth() + 1).padStart(2, "0");
  const day = new String(date.getDate()).padStart(2, "0");

  return {
    file: `website/blog/${year}-${month}-${day}-${version}.md`,
    path: `blog/${year}/${month}/${day}/${version}.html`
  };
}

function writeChangelog({ version, previousVersion, releaseNotes }) {
  const changelog = fs.readFileSync("CHANGELOG.md", "utf-8");
  const newEntry = dedent`
    # ${version}

    [diff](https://github.com/prettier/prettier/compare/${previousVersion}...${version})

    ${releaseNotes}
  `;
  fs.writeFileSync("CHANGELOG.md", newEntry + "\n\n" + changelog);
}

module.exports = async function({ version, previousVersion }) {
  const semverDiff = semver.diff(version, previousVersion);

  if (semverDiff !== "patch") {
    const blogPost = getBlogPostInfo(version);
    writeChangelog({
      version,
      previousVersion,
      releaseNotes: `🔗 [Release Notes](https://prettier.io/${blogPost.path})`
    });
    if (fs.existsSync(blogPost.file)) {
      // Everything is fine, this step is finished
      return;
    }
    console.warn(
      dedent(chalk`
        {yellow warning} The file {bold ${blogPost.file}} doesn't exist, but it will be referenced in {bold CHANGELOG.md}. Make sure to create it later.

        Press ENTER to continue.
      `)
    );
  } else {
    console.log(
      dedent(chalk`
        {yellow.bold A manual step is necessary.}

        You can copy the entries from {bold changelog_unreleased/*/pr-*.md} to {bold CHANGELOG.md}
        and update it accordingly.

        You don't need to commit the file, the script will take care of that.

        When you're finished, press ENTER to continue.
      `)
    );
  }

  await waitForEnter();
  await execa("yarn", ["lint-docs", "--fix"]);
};
