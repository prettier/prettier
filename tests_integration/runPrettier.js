"use strict";

const fs = require("fs");
const path = require("path");
const stripAnsi = require("strip-ansi");
const SynchronousPromise = require("synchronous-promise").SynchronousPromise;

const isProduction = process.env.NODE_ENV === "production";
const prettierRootDir = isProduction ? process.env.PRETTIER_DIR : "../";
const prettierPkg = require(path.join(prettierRootDir, "package.json"));
const bin = prettierPkg.bin;
const prettierCli = path.join(
  prettierRootDir,
  typeof bin === "object" ? bin.prettier : bin
);

const thirdParty = isProduction
  ? path.join(prettierRootDir, "./third-party")
  : path.join(prettierRootDir, "./src/common/third-party");

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

  jest.spyOn(Date, "now").mockImplementation(() => 0);

  const write = [];

  jest.spyOn(fs, "writeFileSync").mockImplementation((filename, content) => {
    write.push({ filename, content });
  });

  const origStatSync = fs.statSync;

  jest.spyOn(fs, "statSync").mockImplementation(filename => {
    if (path.basename(filename) === "virtualDirectory") {
      return origStatSync(path.join(__dirname, __filename));
    }
    return origStatSync(filename);
  });

  const originalCwd = process.cwd();
  const originalArgv = process.argv;
  const originalExitCode = process.exitCode;
  const originalStdinIsTTY = process.stdin.isTTY;
  const originalStdoutIsTTY = process.stdout.isTTY;
  const originalEnv = process.env;

  process.chdir(normalizeDir(dir));
  process.stdin.isTTY = !!options.isTTY;
  process.stdout.isTTY = !!options.stdoutIsTTY;
  process.argv = ["path/to/node", "path/to/prettier/bin"].concat(args);
  process.env = Object.assign({}, process.env, options.env);

  jest.resetModules();

  // We cannot use `jest.setMock("get-stream", impl)` here, because in the
  // production build everything is bundled into one file so there is no
  // "get-stream" module to mock.
  jest
    .spyOn(require(thirdParty), "getStream")
    .mockImplementation(() => SynchronousPromise.resolve(options.input || ""));
  jest
    .spyOn(require(thirdParty), "isCI")
    .mockImplementation(() => process.env.CI);
  jest
    .spyOn(require(thirdParty), "cosmiconfig")
    .mockImplementation((moduleName, options) =>
      require("cosmiconfig")(
        moduleName,
        Object.assign({}, options, { stopDir: __dirname })
      )
    );
  jest
    .spyOn(require(thirdParty), "findParentDir")
    .mockImplementation(() => process.cwd());

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
    process.stdout.isTTY = originalStdoutIsTTY;
    process.env = originalEnv;
    jest.restoreAllMocks();
  }

  const result = { status, stdout, stderr, write };

  const testResult = testOptions => {
    testOptions = testOptions || {};

    Object.keys(result).forEach(name => {
      test(`(${name})`, () => {
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
    });

    return result;
  };

  return Object.assign({ test: testResult }, result);

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
