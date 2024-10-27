import fs from "node:fs";
import path from "node:path";
import createEsmUtils from "esm-utils";
import semver from "semver";

const { __dirname } = createEsmUtils(import.meta);

export const changelogUnreleasedDirPath = path.join(
  __dirname,
  "../../changelog_unreleased"
);

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
  return data
    .replace(
      /prettier stable/gi,
      `Prettier ${isPatch ? prevVer : formatVersion(prevVer)}`
    )
    .replace(
      /prettier main/gi,
      `Prettier ${isPatch ? newVer : formatVersion(newVer)}`
    );
}

function formatVersion(version) {
  return `${semver.major(version)}.${semver.minor(version)}`;
}

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
