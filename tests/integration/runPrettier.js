"use strict";

const fs = require("fs");
const path = require("path");
const stripAnsi = require("strip-ansi");
const { prettierCli, thirdParty } = require("./env");

async function run(dir, args, options) {
  args = Array.isArray(args) ? args : [args];

  let status;
  let stdout = "";
  let stderr = "";

  jest.spyOn(process, "exit").mockImplementation((exitCode) => {
    if (status === undefined) {
      status = exitCode || 0;
    }
  });

  jest
    .spyOn(process.stdout, "write")
    .mockImplementation((text) => appendStdout(text));

  jest
    .spyOn(process.stderr, "write")
    .mockImplementation((text) => appendStderr(text));

  jest
    .spyOn(console, "log")
    .mockImplementation((text) => appendStdout(text + "\n"));

  jest
    .spyOn(console, "warn")
    .mockImplementation((text) => appendStderr(text + "\n"));

  jest
    .spyOn(console, "error")
    .mockImplementation((text) => appendStderr(text + "\n"));

  jest.spyOn(Date, "now").mockImplementation(() => 0);

  const write = [];

  jest
    .spyOn(fs.promises, "writeFile")
    // eslint-disable-next-line require-await
    .mockImplementation(async (filename, content) => {
      write.push({ filename, content });
    });

  /*
    A fake non-existing directory to test plugin search won't crash.

    See:
    - `isDirectory` function in `src/common/load-plugins.js`
    - Test file `./__tests__/plugin-virtual-directory.js`
    - Pull request #5819
  */
  const originalStatSync = fs.statSync;
  jest
    .spyOn(fs, "statSync")
    .mockImplementation((filename) =>
      originalStatSync(
        path.basename(filename) === "virtualDirectory" ? __filename : filename
      )
    );

  const originalCwd = process.cwd();
  const originalArgv = process.argv;
  const originalExitCode = process.exitCode;
  const originalStdinIsTTY = process.stdin.isTTY;
  const originalStdoutIsTTY = process.stdout.isTTY;

  process.chdir(normalizeDir(dir));
  process.stdin.isTTY = Boolean(options.isTTY);
  process.stdout.isTTY = Boolean(options.stdoutIsTTY);
  process.argv = ["path/to/node", "path/to/prettier/bin", ...args];

  jest.resetModules();

  // We cannot use `jest.setMock("get-stream", impl)` here, because in the
  // production build everything is bundled into one file so there is no
  // "get-stream" module to mock.
  jest
    .spyOn(require(thirdParty), "getStdin")
    // eslint-disable-next-line require-await
    .mockImplementation(async () => options.input || "");
  jest
    .spyOn(require(thirdParty), "isCI")
    .mockImplementation(() => Boolean(options.ci));
  jest
    .spyOn(require(thirdParty), "cosmiconfig")
    .mockImplementation((moduleName, options) =>
      require("cosmiconfig").cosmiconfig(moduleName, {
        ...options,
        stopDir: path.join(__dirname, "cli"),
      })
    );
  jest
    .spyOn(require(thirdParty), "cosmiconfigSync")
    .mockImplementation((moduleName, options) =>
      require("cosmiconfig").cosmiconfigSync(moduleName, {
        ...options,
        stopDir: path.join(__dirname, "cli"),
      })
    );
  jest
    .spyOn(require(thirdParty), "findParentDir")
    .mockImplementation(() => process.cwd());

  try {
    await require(prettierCli);
    status = (status === undefined ? process.exitCode : status) || 0;
  } catch (error) {
    status = 1;
    stderr += error.message;
  } finally {
    process.chdir(originalCwd);
    process.argv = originalArgv;
    process.exitCode = originalExitCode;
    process.stdin.isTTY = originalStdinIsTTY;
    process.stdout.isTTY = originalStdoutIsTTY;
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

let hasRunningCli = false;
function runPrettier(dir, args = [], options = {}) {
  let promise;
  const getters = {
    get status() {
      return runCli().then(({ status }) => status);
    },
    get stdout() {
      return runCli().then(({ stdout }) => stdout);
    },
    get stderr() {
      return runCli().then(({ stderr }) => stderr);
    },
    get write() {
      return runCli().then(({ write }) => write);
    },
    test: testResult,
  };

  return getters;

  function runCli() {
    if (hasRunningCli) {
      throw new Error("Please wait for previous CLI to exit.");
    }

    if (!promise) {
      hasRunningCli = true;
      promise = run(dir, args, options).finally(() => {
        hasRunningCli = false;
      });
    }
    return promise;
  }

  function testResult(testOptions) {
    for (const name of ["status", "stdout", "stderr", "write"]) {
      test(`(${name})`, async () => {
        const result = await runCli();
        const value =
          // \r is trimmed from jest snapshots by default;
          // manually replacing this character with /*CR*/ to test its true presence
          // If ignoreLineEndings is specified, \r is simply deleted instead
          typeof result[name] === "string"
            ? options.ignoreLineEndings
              ? stripAnsi(result[name]).replace(/\r/g, "")
              : stripAnsi(result[name]).replace(/\r/g, "/*CR*/")
            : result[name];
        if (name in testOptions) {
          if (name === "status" && testOptions[name] === "non-zero") {
            expect(value).not.toEqual(0);
          } else {
            expect(value).toEqual(testOptions[name]);
          }
        } else {
          expect(value).toMatchSnapshot();
        }
      });
    }

    return getters;
  }
}

function normalizeDir(dir) {
  const isRelative = dir[0] !== "/";
  return isRelative ? path.resolve(__dirname, dir) : dir;
}

module.exports = runPrettier;
