"use strict";

const fs = require("fs");
const path = require("path");
const execa = require("execa");
const { outdent } = require("outdent");
const globby = require("globby");
const { logPromise } = require("../utils");

async function clean() {
  const changelogUnreleasedDir = path.join(
    __dirname,
    "../../../changelog_unreleased"
  );

  // Revert blog-post-intro.md
  const introFile = path.join(changelogUnreleasedDir, "blog-post-intro.md");
  fs.writeFileSync(
    introFile,
    outdent`
  ---
  author: "🚧"
  authorURL: "https://github.com/🚧"
  title: "Prettier 🚧"
  ---

  🚧 Write an introduction here.

`
  );

  const files = await globby("*/*.md", { cwd: changelogUnreleasedDir });
  for (const file of files) {
    fs.unlinkSync(path.join(changelogUnreleasedDir, file));
  }

  // Commit and push changes to remote
  await execa("git", ["add", "."]);
  await execa("git", ["commit", "-m", "Clean changelog_unreleased"]);
  await execa("git", ["push"]);
}

module.exports = async function () {
  await logPromise("Cleaning changelog_unreleased", clean());
};
