#!/usr/bin/env node

import fs from "node:fs";
import { fileURLToPath } from "node:url";
import globby from "globby";

const changelogUnreleasedDir = fileURLToPath(
  new URL("../changelog_unreleased", import.meta.url)
);

const files = globby.sync(["blog-post-intro.md", "*/*.md"], {
  cwd: changelogUnreleasedDir,
  absolute: true,
});
for (const file of files) {
  fs.unlinkSync(file);
}
