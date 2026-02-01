#!/usr/bin/env node

import spawn from "nano-spawn";

async function getChangedFiles() {
  const { stdout } = await spawn("git", ["diff", "--name-only"]);
  return stdout.split("\n");
}

async function ensureNoFilesChanged() {
  const changedFiles = await getChangedFiles();

  if (changedFiles.length === 0) {
    console.log("✅ No files changed.");
    return;
  }

  console.log(
    `❌ ${changedFiles.length} file${changedFiles.length === 1 ? "" : "s"} changed:`,
  );
  console.log(changedFiles.map((file) => ` - ${file}`).join("\n"));
  console.log();

  try {
    await spawn("git", ["diff", "--exit-code"], { stdio: "inherit" });
  } catch (error) {
    process.exitCode = error.exitCode;
  }
}

await ensureNoFilesChanged();
