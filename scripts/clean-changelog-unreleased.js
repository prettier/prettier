#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const globby = require("globby");

const changelogUnreleasedDir = path.join(__dirname, "../changelog_unreleased");

const files = globby.sync(["blog-post-intro.md", "*/*.md"], {
  cwd: changelogUnreleasedDir,
  absolute: true,
});
for (const file of files) {
  fs.unlinkSync(file);
}
