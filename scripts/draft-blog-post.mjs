#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import rimraf from "rimraf";
import semver from "semver";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const changelogUnreleasedDir = path.join(__dirname, "../changelog_unreleased");
const blogDir = path.join(__dirname, "../website/blog");
const introTemplateFile = path.join(
  changelogUnreleasedDir,
  "BLOG_POST_INTRO_TEMPLATE.md"
);
const introFile = path.join(changelogUnreleasedDir, "blog-post-intro.md");
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

const categoriesByDir = categories.reduce((result, category) => {
  result[category.dir] = category;
  return result;
}, {});

const dirs = fs
  .readdirSync(changelogUnreleasedDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory());

for (const dir of dirs) {
  const dirPath = path.join(changelogUnreleasedDir, dir.name);
  const category = categoriesByDir[dir.name];

  if (!category) {
    throw new Error("Unknown category: " + dir.name);
  }

  category.entries = fs
    .readdirSync(dirPath)
    .filter((fileName) => /^\d+\.md$/.test(fileName))
    .map((fileName) => {
      const [title, ...rest] = fs
        .readFileSync(path.join(dirPath, fileName), "utf8")
        .trim()
        .split("\n");

      const improvement = title.match(/\[IMPROVEMENT(:(\d+))?]/);

      const section = title.includes("[HIGHLIGHT]")
        ? "highlight"
        : title.includes("[BREAKING]")
        ? "breaking"
        : improvement
        ? "improvement"
        : undefined;

      const order =
        section === "improvement" && improvement[2] !== undefined
          ? Number(improvement[2])
          : undefined;

      const content = [processTitle(title), ...rest].join("\n");

      return { fileName, section, order, content };
    });
}

rimraf.sync(postGlob);

fs.writeFileSync(
  postFile,
  replaceVersions(
    [
      fs.readFileSync(introFile, "utf8").trim(),
      "<!--truncate-->",
      ...printEntries({
        title: "Highlights",
        filter: (entry) => entry.section === "highlight",
      }),
      ...printEntries({
        title: "Breaking Changes",
        filter: (entry) => entry.section === "breaking",
      }),
      ...printEntries({
        title: "Formatting Improvements",
        filter: (entry) => entry.section === "improvement",
      }),
      ...printEntries({
        title: "Other Changes",
        filter: (entry) => !entry.section,
      }),
    ].join("\n\n") + "\n"
  )
);

function processTitle(title) {
  return title
    .replace(/\[(BREAKING|HIGHLIGHT|IMPROVEMENT(:\d+)?)]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^#{4} [a-z]/, (s) => s.toUpperCase())
    .replace(/(?<![[`])@([\w-]+)/g, "[@$1](https://github.com/$1)")
    .replace(
      /(?<![[`])#(\d{4,})/g,
      "[#$1](https://github.com/prettier/prettier/pull/$1)"
    );
}

function printEntries({ title, filter }) {
  const result = [];

  for (const { entries = [], title } of categories) {
    const filteredEntries = entries.filter(filter);
    if (filteredEntries.length > 0) {
      filteredEntries.sort((a, b) => {
        if (a.order !== undefined) {
          return b.order === undefined ? 1 : a.order - b.order;
        }
        return a.fileName.localeCompare(b.fileName, "en", { numeric: true });
      });
      result.push(
        "### " + title,
        ...filteredEntries.map((entry) => entry.content)
      );
    }
  }

  if (result.length > 0) {
    result.unshift("## " + title);
  }

  return result;
}

function formatVersion(version) {
  return `${semver.major(version)}.${semver.minor(version)}`;
}

function replaceVersions(data) {
  return data
    .replace(/prettier stable/gi, `Prettier ${formatVersion(previousVersion)}`)
    .replace(/prettier main/gi, `Prettier ${formatVersion(version)}`);
}
