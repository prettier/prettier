"use strict";

const { default: stripAnsi } = require("../../../vendors/strip-ansi.js");
const runPrettier = require("../run-prettier.js");

test("do not show logs with --loglevel silent", async () => {
  await runPrettierWithLogLevel("silent", null);
});

test("do not show warnings with --loglevel error", async () => {
  await runPrettierWithLogLevel("error", ["[error]"]);
});

test("show errors and warnings with --loglevel warn", async () => {
  await runPrettierWithLogLevel("warn", ["[error]", "[warn]"]);
});

test("show all logs with --loglevel debug", async () => {
  await runPrettierWithLogLevel("debug", ["[error]", "[warn]", "[debug]"]);
});

describe("--write with --loglevel=silent doesn't log filenames", () => {
  runPrettier("cli/write", [
    "--write",
    "unformatted.js",
    "--loglevel=silent",
  ]).test({
    status: 0,
  });
});

describe("Should use default level logger to log `--loglevel` error", () => {
  runPrettier("cli/loglevel", ["--loglevel", "a-unknown-log-level"]).test({
    status: "non-zero",
    write: [],
    stdout: "",
  });
});

describe("loglevel should not effect information print", () => {
  for (const { argv, runOptions, assertOptions } of [
    {
      argv: ["--version"],
      assertOptions: {
        stdout(value) {
          expect(value).not.toBe("");
        },
      },
    },
    {
      argv: ["--help"],
      assertOptions: {
        stdout(value) {
          expect(value.includes("-v, --version")).toBe(true);
        },
      },
    },
    {
      argv: ["--help", "write"],
      assertOptions: {
        stdout(value) {
          expect(value.startsWith("-w, --write")).toBe(true);
        },
      },
    },
    {
      argv: ["--support-info"],
      assertOptions: {
        stdout(value) {
          expect(JSON.parse(value)).toBeDefined();
        },
      },
    },
    {
      argv: ["--find-config-path", "any-file"],
      assertOptions: {
        stdout: ".prettierrc\n",
      },
    },
    {
      argv: ["--file-info", "any-js-file.js"],
      assertOptions: {
        stdout(value) {
          expect(JSON.parse(value)).toEqual({
            ignored: false,
            inferredParser: "babel",
          });
        },
      },
    },
    {
      argv: [],
      runOptions: { isTTY: true },
      assertOptions: {
        status: "non-zero",
        stdout(value) {
          expect(value.includes("-v, --version")).toBe(true);
        },
      },
    },
    {
      argv: ["--parser", "babel"],
      runOptions: { input: "foo" },
      assertOptions: { stdout: "foo;\n" },
    },
  ]) {
    runPrettier("cli/loglevel", ["--loglevel", "silent", ...argv], {
      ...runOptions,
      title: argv.join(" "),
    }).test({
      stderr: "",
      status: 0,
      write: [],
      ...assertOptions,
    });
  }
});

async function runPrettierWithLogLevel(logLevel, patterns) {
  const result = await runPrettier("cli/loglevel", [
    "--loglevel",
    logLevel,
    "--unknown-option",
    "--parser",
    "unknown-parser",
    "not-found.js",
  ]);

  expect(result.status).toBe(2);

  const stderr = stripAnsi(result.stderr);

  if (patterns) {
    for (const pattern of patterns) {
      expect(stderr).toMatch(pattern);
    }
  } else {
    expect(stderr).toMatch(/^\s*$/);
  }
}
