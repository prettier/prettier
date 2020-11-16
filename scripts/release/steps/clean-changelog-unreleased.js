"use strict";

const fs = require("fs");
const path = require("path");
const execa = require("execa");
const { outdent } = require("outdent");
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

  // Remove pr-xxxxx.md files
  const categories = new Set([
    "angular",
    "api",
    "cli",
    "css",
    "flow",
    "graphql",
    "handlebars",
    "html",
    "javascript",
    "json",
    "less",
    "lwc",
    "markdown",
    "mdx",
    "scss",
    "typescript",
    "vue",
    "yaml",
  ]);
  fs.readdirSync(changelogUnreleasedDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .forEach((dir) => {
      const dirPath = path.join(changelogUnreleasedDir, dir.name);
      if (!categories.has(dir.name)) {
        throw new Error(`Unknown category: ${dir.name}`);
      }
      fs.readdirSync(dirPath)
        .filter((fileName) => /^pr-\d+\.md$/.test(fileName))
        .map((fileName) => path.join(dirPath, fileName))
        .forEach((file) => {
          fs.unlinkSync(file);
        });
    });

  // Commit and push changes to remote
  await execa("git", ["add", "."]);
  await execa("git", ["commit", "-m", "Clean changelog_unreleased"]);
  await execa("git", ["push"]);
}

module.exports = async function () {
  await logPromise("Cleaning changelog_unreleased", clean());
};
