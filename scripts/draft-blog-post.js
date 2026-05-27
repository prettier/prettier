#!/usr/bin/env node

import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import fg from "fast-glob";
import semver from "semver";
import {
  categories,
  changelogUnreleasedDirectory,
  getEntries,
  printEntries,
  replaceVersions,
} from "./utilities/changelog.js";

const require = createRequire(import.meta.url);
const blogDir = path.join(import.meta.dirname, "../website/blog");
const introTemplateFile = new URL(
  "BLOG_POST_INTRO_TEMPLATE.md",
  changelogUnreleasedDirectory,
);
const introFile = new URL("blog-post-intro.md", changelogUnreleasedDirectory);
if (!fs.existsSync(introFile)) {
  fs.copyFileSync(introTemplateFile, introFile);
}

const prevVersion = require("../node_modules/prettier/package.json").version;
const { version } = require("../package.json");
const nextVersion = `${semver.major(version)}.${semver.minor(
  version,
)}.${semver.patch(version)}`;

const postGlob = path.join(blogDir, `????-??-??-${nextVersion}.md`);
const postFile = path.join(
  blogDir,
  `${new Date().toISOString().replace(/T.+/, "")}-${nextVersion}.md`,
);

const categoriesByDir = new Map(
  categories.map((category) => [category.dir, category]),
);

for (const entry of fs.readdirSync(changelogUnreleasedDirectory, {
  withFileTypes: true,
})) {
  if (!entry.isDirectory()) {
    continue;
  }

  const dirPath = path.join(entry.path, entry.name);
  const category = categoriesByDir.get(entry.name);

  if (!category) {
    throw new Error("Unknown category: " + entry.name);
  }

  category.entries = getEntries(dirPath, { useFriendlyHeadingId: true });
}

for (const filePath of fg.sync(postGlob)) {
  fs.rmSync(filePath);
}

const introFileData = fs.readFileSync(introFile, "utf8").trim();

const TRUNCATE_COMMENT = "<!-- truncate -->";
const shouldPrintTruncate = !introFileData.includes(TRUNCATE_COMMENT);

fs.writeFileSync(
  postFile,
  replaceVersions(
    [
      introFileData,
      shouldPrintTruncate ? TRUNCATE_COMMENT : "",
      ...printEntriesWithTitle({
        title: "Highlights",
        filter: (entry) => entry.section === "highlight",
      }),
      ...printEntriesWithTitle({
        title: "Breaking Changes",
        filter: (entry) => entry.section === "breaking",
      }),
      ...printEntriesWithTitle({
        title: "Formatting Improvements",
        filter: (entry) => entry.section === "improvement",
      }),
      ...printEntriesWithTitle({
        title: "Other Changes",
        filter: (entry) => !entry.section,
      }),
    ]
      .filter(Boolean)
      .join("\n\n") + "\n",
    prevVersion,
    nextVersion,
  ),
);

function printEntriesWithTitle({ title, filter }) {
  const result = [];

  for (const { entries = [], title } of categories) {
    const filteredEntries = entries.filter(filter);
    if (filteredEntries.length > 0) {
      result.push("### " + title, ...printEntries(filteredEntries));
    }
  }

  if (result.length > 0) {
    result.unshift("## " + title);
  }

  return result;
}
