#!/usr/bin/env node

// Make sure format test directories contains format test script.

import fs from "node:fs/promises";
import path from "node:path";
import { PROJECT_ROOT } from "./utils/index.js";

const FORMAT_TEST_DIRECTORY = path.join(PROJECT_ROOT, "tests/format/");
const TEST_SCRIPT_FILE_NAME = "format.test.js";
const SNAPSHOTS_DIRECTORY_NAME = "__snapshots__";
const IGNORED = new Set([
  path.join(FORMAT_TEST_DIRECTORY, "markdown/spec/remark-bug"),
]);

async function* checkDirectory(directory) {
  if (IGNORED.has(directory)) {
    return;
  }

  const files = await fs.readdir(directory, { withFileTypes: true });

  yield {
    directory,
    ok:
      directory === FORMAT_TEST_DIRECTORY ||
      !files.some(
        (file) => file.isFile() && file.name !== TEST_SCRIPT_FILE_NAME,
      ) ||
      files.some(
        (file) => file.isFile() && file.name === TEST_SCRIPT_FILE_NAME,
      ),
  };

  for (const dirent of files) {
    if (dirent.isDirectory() && dirent.name !== SNAPSHOTS_DIRECTORY_NAME) {
      yield* checkDirectory(path.join(dirent.path, dirent.name));
    }
  }
}

const directories = [];
for await (const { directory, ok } of checkDirectory(FORMAT_TEST_DIRECTORY)) {
  const name = path.relative(PROJECT_ROOT, directory).replaceAll("\\", "/");

  if (!ok) {
    console.log(name);
    directories.push(name);
  }
}

if (directories.length > 0) {
  console.log();
  console.error(
    `${directories.length > 1 ? "Directories" : "Directory"} above missing "${TEST_SCRIPT_FILE_NAME}" file.`,
  );
  process.exitCode = 1;
} else {
  console.log("Pass.");
}
