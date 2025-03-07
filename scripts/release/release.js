#!/usr/bin/env node

/* This file can't use any dependency since the dependencies may not installed yet */
import { exec } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
function runCommand(command) {
  return new Promise((resolve, reject) => {
    const { stdout, stderr } = exec(command, { cwd: directory }, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    stdout.pipe(process.stdout);
    stderr.pipe(process.stderr);
  });
}

// Fetch git tags to get the previous version number (i.e. the latest tag)
await runCommand("git fetch --tags");

// Install script's dependencies before any require
await runCommand("yarn");

// Ready to run
await import("./run.js");
