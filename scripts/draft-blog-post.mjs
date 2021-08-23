#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import rimraf from "rimraf";
import createEsmUtils from "esm-utils";
import {
  getEntries,
  replaceVersions,
  changelogUnreleasedDirPath,
  changelogUnreleasedDirs,
  printEntries,
} from "./utils/changelog.mjs";

const { __dirname, require } = createEsmUtils(import.meta);
const blogDir = path.join(__dirname, "../website/blog");
const introTemplateFile = path.join(
  changelogUnreleasedDirPath,
  "BLOG_POST_INTRO_TEMPLATE.md"
);
const introFile = path.join(changelogUnreleasedDirPath, "blog-post-intro.md");
if (!fs.existsSync(introFile)) {
  fs.copyFileSync(introTemplateFile, introFile);
}
const previousVersion = require("prettier/package.json").version;
const version = require("../package.json").version.replace(/-.+/, "");
const postGlob = path.join(blogDir, `????-??-??-${version}.md`);
const postFile = path.join(
  blogDir,
  `${new Date().toISOString().replace(/T.+/, "")}-${version}.md`
);

const categories = [
  { dir: "javascript", title: "JavaScript" },
  { dir: "typescript", title: "TypeScript" },
  { dir: "flow", title: "Flow" },
  { dir: "json", title: "JSON" },
  { dir: "css", title: "CSS" },
  { dir: "scss", title: "SCSS" },
  { dir: "less", title: "Less" },
  { dir: "html", title: "HTML" },
  { dir: "vue", title: "Vue" },
  { dir: "angular", title: "Angular" },
  { dir: "lwc", title: "LWC" },
  { dir: "handlebars", title: "Ember / Handlebars" },
  { dir: "graphql", title: "GraphQL" },
  { dir: "markdown", title: "Markdown" },
  { dir: "mdx", title: "MDX" },
  { dir: "yaml", title: "YAML" },
  { dir: "api", title: "API" },
  { dir: "cli", title: "CLI" },
];

const categoriesByDir = new Map(
  categories.map((category) => [category.dir, category])
);

for (const dir of changelogUnreleasedDirs) {
  const dirPath = path.join(changelogUnreleasedDirPath, dir.name);
  const category = categoriesByDir.get(dir.name);

  if (!category) {
    throw new Error("Unknown category: " + dir.name);
  }

  category.entries = getEntries(dirPath);
}

rimraf.sync(postGlob);

fs.writeFileSync(
  postFile,
  replaceVersions(
    [
      fs.readFileSync(introFile, "utf8").trim(),
      "<!--truncate-->",
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
    ].join("\n\n") + "\n",
    previousVersion,
    version
  )
);

function printEntriesWithTitle({ title, filter }) {
  const result = [];

  for (const { entries = [], title } of categories) {
    const filteredEntries = entries.filter(filter);
    if (filteredEntries.length > 0) {
      result.push("###" + title, ...printEntries(filteredEntries));
    }
  }

  if (result.length > 0) {
    result.unshift("## " + title);
  }

  return result;
}
