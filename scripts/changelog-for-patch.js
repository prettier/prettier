#!/usr/bin/env node

import path from "node:path";
import { parseArgs } from "node:util";
import semver from "semver";
import {
  categories,
  changelogUnreleasedDirPath,
  changelogUnreleasedDirs,
  getEntries,
  printEntries,
  replaceVersions,
} from "./utils/changelog.js";

const { previousVersion, newVersion } = parseArguments();

const entries = changelogUnreleasedDirs.flatMap((dir) => {
  const dirPath = path.join(changelogUnreleasedDirPath, dir.name);
  const { title } = categories.find((category) => category.dir === dir.name);

  return getEntries(dirPath).map((entry) => {
    const content =
      entry.content.slice(0, 4) + ` ${title}:` + entry.content.slice(4);
    return { ...entry, content };
  });
});

console.log(
  replaceVersions(
    printEntries(entries).join("\n\n"),
    previousVersion,
    newVersion,
    /** isPatch */ true,
  ),
);

function parseArguments() {
  const {
    values: { "prev-version": previousVersion, "new-version": newVersion },
  } = parseArgs({
    options: {
      "prev-version": { type: "string" },
      "new-version": { type: "string" },
    },
  });
  if (
    !previousVersion ||
    !newVersion ||
    semver.compare(previousVersion, newVersion) !== -1
  ) {
    throw new Error(
      `Invalid argv, prev-version: ${previousVersion}, new-version: ${newVersion}`,
    );
  }
  return { previousVersion, newVersion };
}
