"use strict";

const chalk = require("chalk");
const dedent = require("dedent");
const fs = require("fs");
const prsMergedSince = require("prs-merged-since");
const semver = require("semver");
const { logPromise, keypress } = require("../utils");

async function prepareReleaseNotes({ version, previousVersion }) {
  const versionDiff = semver.diff(version, previousVersion);

  let changes;
  let warning;
  let releaseNotes;

  if (versionDiff !== "patch") {
    // Changelog is the blog post, so we just add a link to it
    changes = "blog post link";

    const date = new Date();
    const year = date.getFullYear();
    const month = new String(date.getMonth() + 1).padStart(2, "0");
    const day = new String(date.getDate()).padStart(2, "0");
    const blogPostFile = `website/blog/${year}-${month}-${day}-${version}.md`;
    const blogPostPath = `${year}/${month}/${day}/${version}.html`;

    releaseNotes = `- [Release Notes](https://prettier.io/blog/${blogPostPath})`;

    if (!fs.existsSync(blogPostFile)) {
      warning = chalk`Make sure the blog post file {yellow ${blogPostFile}} will be created.`;
    }
  } else {
    // Changelog should be the most important PRs, let's add everything
    // and ask for the releaser to edit the file later.
    changes = "merged PRs since last release";
    const prs = await prsMergedSince({
      repo: "prettier/prettier",
      tag: previousVersion,
      githubApiToken: process.env.GITHUB_API_TOKEN
    });
    releaseNotes = prs
      .map(pr => `- ${pr.title} ([#${pr.number}](${pr.html_url}))`)
      .join("\n");
  }

  const header = dedent`
    # ${version}

    [link](https://github.com/prettier/prettier/compare/${previousVersion}...${version})
  `;
  const changelog = fs.readFileSync("CHANGELOG.md", "utf-8");
  fs.writeFileSync(
    "CHANGELOG.md",
    header + "\n\n" + releaseNotes + "\n\n" + changelog
  );

  return {
    changes,
    warning
  };
}

async function waitForChangelog({ changes, warning }) {
  console.log(
    dedent(chalk`
      {yellow.bold A manual step is necessary.}
      The script has updated the file {bold CHANGELOG.md} with a draft of ${changes}, you can make any changes now if necessary.
      You don't need to commit the file, the script will take care of that.
    `)
  );
  if (warning) {
    console.log("\n" + warning);
  }
  console.log("\nPress any key to continue");

  await keypress();
}

module.exports = async function(params) {
  const result = await logPromise(
    "Preparing release notes",
    prepareReleaseNotes(params)
  );

  console.log();
  await waitForChangelog(result);
};
