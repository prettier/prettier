#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const globby = require("globby");

const changelogUnreleasedDir = path.join(__dirname, "../changelog_unreleased");

// Remove blog-post-intro.md
const introFile = path.join(changelogUnreleasedDir, "blog-post-intro.md");
fs.unlinkSync(introFile);

// Remove change files
const files = globby.sync("*/*.md", { cwd: changelogUnreleasedDir });
for (const file of files) {
  fs.unlinkSync(path.join(changelogUnreleasedDir, file));
}
