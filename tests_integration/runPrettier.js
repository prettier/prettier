"use strict";

const path = require("path");
const fs = require("fs");

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

  const write = [];

  const spiedFsWriteFileSync = jest.spyOn(fs, "writeFileSync");
  spiedFsWriteFileSync.mockImplementation((filename, content) => {
    write.push({ filename, content });
  });

  const originalCwd = process.cwd();
  const originalIsTTY = process.stdin.isTTY;
  const originalArgv = process.argv;
  const originalExitCode = process.exitCode;

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
    stderr += error.message;
    status = 1;
  } finally {
    process.exitCode = originalExitCode;
    process.stdin.isTTY = originalIsTTY;
    process.argv = originalArgv;
    process.chdir(originalCwd);

    spiedProcessExit.mockRestore();
    spiedStdoutWrite.mockRestore();
    spiedStderrWrite.mockRestore();
    spiedConsoleLog.mockRestore();
    spiedConsoleWarn.mockRestore();
    spiedConsoleError.mockRestore();
    spiedFsWriteFileSync.mockRestore();
  }

  return { status, stdout, stderr, write };
}

function normalizeDir(dir) {
  const isRelative = dir[0] !== "/";
  return isRelative ? path.resolve(__dirname, dir) : dir;
}

module.exports = runPrettier;
