"use strict";

const fs = require("fs");
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";
const prettierApi = isProduction ? "../dist/index" : "../index";
const prettierCli = isProduction ? "../dist/bin/prettier" : "../bin/prettier";

function runPrettier(dir, args, options) {
  args = args || [];
  options = options || {};

  let status;
  let stdout = "";
  let stderr = "";

  jest.spyOn(process, "exit").mockImplementation(exitCode => {
    if (status === undefined) {
      status = exitCode || 0;
    }
  });

  jest
    .spyOn(process.stdout, "write")
    .mockImplementation(text => appendStdout(text));

  jest
    .spyOn(process.stderr, "write")
    .mockImplementation(text => appendStderr(text));

  jest
    .spyOn(console, "log")
    .mockImplementation(text => appendStdout(text + "\n"));

  jest
    .spyOn(console, "warn")
    .mockImplementation(text => appendStderr(text + "\n"));

  jest
    .spyOn(console, "error")
    .mockImplementation(text => appendStderr(text + "\n"));

  const write = [];

  jest.spyOn(fs, "writeFileSync").mockImplementation((filename, content) => {
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
  jest
    .spyOn(require(prettierApi).__debug, "getStream")
    .mockImplementation(() => ({
      then: handler => handler(options.input || "")
    }));

  try {
    require(prettierCli);
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
