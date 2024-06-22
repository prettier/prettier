#!/usr/bin/env node

/*
Clean up `.git-blame-ignore-revs`

Remove revs without actual file change
*/

import fs from "node:fs/promises";

import { execa } from "execa";

const FILE = new URL("../.git-blame-ignore-revs", import.meta.url);
const content = await fs.readFile(FILE, "utf8");

const lines = content.split("\n");
const revsToRemove = new Set();

const IGNORED_FILES = new Set(["package.json", "yarn.lock"]);
async function getChangedFiles(rev) {
  const { stdout } = await execa("git", [
    "show",
    "--name-only",
    "--pretty=",
    rev,
  ]);

  const files = stdout.split("\n");
  return files;
}

for (const line of lines) {
  if (!line || line.startsWith("#")) {
    continue;
  }

  const rev = line;
  const changedFiles = await getChangedFiles(rev);

  if (changedFiles.every((file) => IGNORED_FILES.has(file))) {
    revsToRemove.add(rev);
  }
}

if (revsToRemove.size > 0) {
  const updated = lines.filter((line) => !revsToRemove.has(line)).join("\n");

  await fs.writeFile(FILE, updated);
}
