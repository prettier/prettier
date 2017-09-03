/*
 * runPrettier – spawns `prettier` process.
 * Adopted from Jest's integration tests suite.
 */
"use strict";

const path = require("path");
const spawnSync = require("cross-spawn").sync;

const prettierCli = require("../src/cli");
const PRETTIER_PATH = path.resolve(__dirname, "../bin/prettier.js");

// return the result of the spawned process:
//  [ 'status', 'signal', 'output', 'pid', 'stdout', 'stderr',
//    'envPairs', 'options', 'args', 'file' ]
function runPrettier(dir, args, options) {
  const result = spawnSync(
    PRETTIER_PATH,
    args || [],
    Object.assign({}, options, { cwd: normalizeDir(dir) })
  );

  result.stdout = result.stdout && result.stdout.toString();
  result.stderr = result.stderr && result.stderr.toString();

  return result;
}

runPrettier.sync = function(dir, args) {
  let status;
  let stdout = "";
  let stderr = "";

  const spiedProcessExit = jest.spyOn(process, "exit");
  spiedProcessExit.mockImplementation(exitCode => {
    if (status === undefined) {
      status = exitCode || 0;
    }
  });

  const spiedStdoutWrite = jest.spyOn(process.stdout, "write");
  spiedStdoutWrite.mockImplementation(text => {
    if (status === undefined) {
      stdout += text;
    }
  });

  const spiedStderrWrite = jest.spyOn(process.stderr, "write");
  spiedStderrWrite.mockImplementation(text => {
    if (status === undefined) {
      stderr += text;
    }
  });

  const spiedConsoleLog = jest.spyOn(console, "log");
  spiedConsoleLog.mockImplementation(text => {
    if (status === undefined) {
      stdout += text + "\n";
    }
  });

  const spiedConsoleWarn = jest.spyOn(console, "warn");
  spiedConsoleWarn.mockImplementation(text => {
    if (status === undefined) {
      stderr += text + "\n";
    }
  });

  const spiedConsoleError = jest.spyOn(console, "error");
  spiedConsoleError.mockImplementation(text => {
    if (status === undefined) {
      stderr += text + "\n";
    }
  });

  const originalCwd = process.cwd();
  const originalIsTTY = process.stdin.isTTY;

  process.chdir(normalizeDir(dir));

  process.stdin.isTTY = false;
  prettierCli.run(args || []);

  status = status || process.exitCode || 0;

  process.exitCode = 0;
  process.stdin.isTTY = originalIsTTY;
  process.chdir(originalCwd);

  spiedProcessExit.mockRestore();
  spiedStdoutWrite.mockRestore();
  spiedStderrWrite.mockRestore();
  spiedConsoleLog.mockRestore();
  spiedConsoleWarn.mockRestore();
  spiedConsoleError.mockRestore();

  return { status, stdout, stderr };
};

function normalizeDir(dir) {
  const isRelative = dir[0] !== "/";
  return isRelative ? path.resolve(__dirname, dir) : dir;
}

module.exports = runPrettier;
