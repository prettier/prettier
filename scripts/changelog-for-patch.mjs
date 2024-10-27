#!/usr/bin/env node

import path from "node:path";
import minimist from "minimist";
import semver from "semver";
import {
  changelogUnreleasedDirPath,
  changelogUnreleasedDirs,
  getEntries,
  printEntries,
  replaceVersions,
} from "./utils/changelog.mjs";

const { previousVersion, newVersion } = parseArgv();

const entries = changelogUnreleasedDirs.flatMap((dir) => {
  const dirPath = path.join(changelogUnreleasedDirPath, dir.name);
  return getEntries(dirPath);
});

console.log(
  replaceVersions(
    printEntries(entries).join("\n\n"),
    previousVersion,
    newVersion,
    /** isPatch */ true
  )
);

function parseArgv() {
  const argv = minimist(process.argv.slice(2));
  const previousVersion = argv["prev-version"];
  const newVersion = argv["new-version"];
  if (
    !previousVersion ||
    !newVersion ||
    semver.compare(previousVersion, newVersion) !== -1
  ) {
    throw new Error(
      `Invalid argv, prev-version: ${previousVersion}, new-version: ${newVersion}`
    );
  }
  return { previousVersion, newVersion };
}
