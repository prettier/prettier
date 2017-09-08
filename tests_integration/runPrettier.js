"use strict";

const fs = require("fs");
const path = require("path");

function runPrettier(dir, args, options) {
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
  process.stdin.isTTY = false;
  process.argv = ["path/to/node", "path/to/prettier/bin"].concat(args || []);

  jest.resetModules();
  jest.setMock("get-stream", () => ({
    then: handler => handler((options && options.input) || "")
  }));

  try {
    require("../bin/prettier");
    status = status || process.exitCode || 0;
  } catch (error) {
    status = 1;
    stderr += error.message;
  } finally {
    process.chdir(originalCwd);
    process.argv = originalArgv;
    process.exitCode = originalExitCode;
    process.stdin.isTTY = originalStdinIsTTY;

    // TODO: use `jest.restoreAllMocks()` once facebook/jest#4436 fixed
    spiedProcessExit.mockRestore();
    spiedStdoutWrite.mockRestore();
    spiedStderrWrite.mockRestore();
    spiedConsoleLog.mockRestore();
    spiedConsoleWarn.mockRestore();
    spiedConsoleError.mockRestore();
    spiedFsWriteFileSync.mockRestore();
  }

  return { status, stdout, stderr, write };

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
