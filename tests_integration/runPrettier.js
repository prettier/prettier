"use strict";

const isProduction = process.env.NODE_ENV === "production";
const fs = require("fs");
const path = require("path");
const stripAnsi = require("strip-ansi");
const bin = require(isProduction ? "../dist/bin/prettier" : "../bin/prettier");

function runPrettier(dir, args, options) {
  args = args || [];
  options = options || {};

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
  spiedStdoutWrite.mockImplementation(text => appendStdout(text));

  const spiedStderrWrite = jest.spyOn(process.stderr, "write");
  spiedStderrWrite.mockImplementation(text => appendStderr(text));

  const spiedConsoleLog = jest.spyOn(console, "log");
  spiedConsoleLog.mockImplementation(text => appendStdout(text + "\n"));

  const spiedConsoleWarn = jest.spyOn(console, "warn");
  spiedConsoleWarn.mockImplementation(text => appendStderr(text + "\n"));

  const spiedConsoleError = jest.spyOn(console, "error");
  spiedConsoleError.mockImplementation(text => appendStderr(text + "\n"));

  const spiedGetStream = jest.spyOn(bin.mockable, "getStream");
  spiedGetStream.mockImplementation(() => ({
    then: handler => handler(options.input || "")
  }));

  const write = [];

  const spiedFsWriteFileSync = jest.spyOn(fs, "writeFileSync");
  spiedFsWriteFileSync.mockImplementation((filename, content) => {
    write.push({ filename, content });
  });

  const originalCwd = process.cwd();
  const originalArgv = process.argv;
  const originalExitCode = process.exitCode;
  const originalStdinIsTTY = process.stdin.isTTY;

  process.chdir(normalizeDir(dir));
  process.stdin.isTTY = !!options.isTTY;
  process.argv = ["path/to/node", "path/to/prettier/bin"].concat(args);

  jest.resetModules();

  try {
    bin.run();
    status = (status === undefined ? process.exitCode : status) || 0;
  } catch (error) {
    status = 1;
    stderr += error.message;
  } finally {
    process.chdir(originalCwd);
    process.argv = originalArgv;
    process.exitCode = originalExitCode;
    process.stdin.isTTY = originalStdinIsTTY;
    jest.restoreAllMocks();
  }

  // Colors are removed from the output here (using `stripAnsi`) because:
  // - It makes snapshots difficult to read.
  // - Manually passing `--no-color` in tests is tedious, and doesn't work in
  //   the production build for some reason (only in the tests).
  return {
    status,
    stdout: stripAnsi(stdout),
    stderr: stripAnsi(stderr),
    write
  };

  function appendStdout(text) {
    if (status === undefined) {
      stdout += text;
    }
  }
  function appendStderr(text) {
    if (status === undefined) {
      stderr += text;
    }
  }
}

function normalizeDir(dir) {
  const isRelative = dir[0] !== "/";
  return isRelative ? path.resolve(__dirname, dir) : dir;
}

module.exports = runPrettier;
