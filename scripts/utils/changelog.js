import fs from "node:fs";
import path from "node:path";
import createEsmUtils from "esm-utils";
import semver from "semver";

const { __dirname } = createEsmUtils(import.meta);

export const changelogUnreleasedDirPath = path.join(
  __dirname,
  "../../changelog_unreleased",
);

export const categories = [
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
  { dir: "mjml", title: "MJML" },
  { dir: "handlebars", title: "Ember / Handlebars" },
  { dir: "graphql", title: "GraphQL" },
  { dir: "markdown", title: "Markdown" },
  { dir: "mdx", title: "MDX" },
  { dir: "yaml", title: "YAML" },
  { dir: "api", title: "API" },
  { dir: "cli", title: "CLI" },
  { dir: "misc", title: "Miscellaneous" },
];

export const changelogUnreleasedDirs = fs
  .readdirSync(changelogUnreleasedDirPath, {
    withFileTypes: true,
  })
  .filter((entry) => entry.isDirectory());

export function getEntries(dirPath) {
  const fileNames = fs
    .readdirSync(dirPath)
    .filter((fileName) => path.extname(fileName) === ".md");
  const entries = fileNames.map((fileName) => {
    const [title, ...rest] = fs
      .readFileSync(path.join(dirPath, fileName), "utf8")
      .trim()
      .split("\n");

    const improvement = title.match(/\[IMPROVEMENT(:(\d+))?\]/u);

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
  return entries;
}

export function printEntries(entries) {
  const result = [];
  if (entries.length > 0) {
    entries.sort((a, b) => {
      if (a.order !== undefined) {
        return b.order === undefined ? 1 : a.order - b.order;
      }
      return a.fileName.localeCompare(b.fileName, "en", { numeric: true });
    });
    result.push(...entries.map((entry) => entry.content));
  }
  return result;
}

export function replaceVersions(data, prevVer, newVer, isPatch = false) {
  if (semver.compare(prevVer, newVer) >= 0) {
    throw new Error(
      `[INVALID VERSION] Next version(${newVer}) should be greater than previous version(${prevVer}).`,
    );
  }

  return data
    .replaceAll(
      /prettier stable/giu,
      `Prettier ${isPatch ? prevVer : formatVersion(prevVer)}`,
    )
    .replaceAll(
      /prettier main/giu,
      `Prettier ${isPatch ? newVer : formatVersion(newVer)}`,
    );
}

function formatVersion(version) {
  return `${semver.major(version)}.${semver.minor(version)}`;
}

function processTitle(title) {
  return title
    .replaceAll(/\[(BREAKING|HIGHLIGHT|IMPROVEMENT(:\d+)?)\]/gu, "")
    .replaceAll(/\s+/gu, " ")
    .replace(/^#{4} [a-z]/u, (s) => s.toUpperCase())
    .replaceAll(/(?<![[`])@([\w-]+)/gu, "[@$1](https://github.com/$1)")
    .replaceAll(
      /(?<![[`])#(\d{4,})/gu,
      "[#$1](https://github.com/prettier/prettier/pull/$1)",
    );
}
