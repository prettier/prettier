#!/usr/bin/env node

import path from "path";
import rimraf from "rimraf";
import execa from "execa";
import tempy from "tempy";
import copy from "cpy";
import { AST_COMPARE_TEST_FIXTURES } from "../tests_config/ast-compare-test.js";

const fixtures = [
  {
    directory: path.join(AST_COMPARE_TEST_FIXTURES, "babel"),
    repository: "https://github.com/babel/babel",
    patterns: "packages/babel-parser/test/fixtures/**/*.js",
  },
];

async function syncFixtures({ directory, repository, patterns }) {
  const tmpDir = tempy.directory();

  console.log(`Cloning repository "${repository}" to "${tmpDir}"...`);
  const childProcess = execa("git", [
    "clone",
    repository,
    "--single-branch",
    "--depth",
    "1",
    "--progress",
    tmpDir,
  ]);
  childProcess.stdout.pipe(process.stdout);
  childProcess.stderr.pipe(process.stderr);
  await childProcess;
  console.log(`Repository "${repository}" cloned to "${tmpDir}".`);

  console.log();
  console.log(`Cleaning "${directory}"...`);
  await new Promise((resolve) => rimraf(directory, {}, resolve));
  console.log(`"${directory}" cleaned.`);

  await copy(patterns, directory, { cwd: tmpDir, parents: true }).on(
    "progress",
    (data) => {
      console.log(
        `Coping files: ${(data.percent * 100).toFixed(1)}% (${
          data.completedFiles
        }/${data.totalFiles})`
      );
    }
  );

  console.log();
  console.log(`Cleaning temp directory "${tmpDir}"...`);
  await new Promise((resolve) => rimraf(tmpDir, {}, resolve));
  console.log(`Temp directory "${tmpDir}" cleaned.`);
}

async function run() {
  for (const fixture of fixtures) {
    console.log(`Synchronizing repository "${fixture.repository}"...`);
    console.log();
    await syncFixtures(fixture);
    console.log();
    console.log(`Repository "${fixture.repository}" Synchronized.`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
