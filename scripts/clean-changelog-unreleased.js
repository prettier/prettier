#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const { outdent } = require("outdent");
const globby = require("globby");

const changelogUnreleasedDir = path.join(__dirname, "../changelog_unreleased");

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

// Remove change files
const files = await globby("*/*.md", { cwd: changelogUnreleasedDir });
for (const file of files) {
  fs.unlinkSync(path.join(changelogUnreleasedDir, file));
}
