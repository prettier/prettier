"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

// ESLint-like behavior
// https://github.com/prettier/prettier/pull/6639#issuecomment-548949954
//
// 1. `prettier dir1 dir2` – prettify all files with supported extensions inside `dir1` and `dir2`.
//
// 2. `prettier dir1 "dir2/**/*"` – prettify all files with supported extensions inside `dir1`
//     as well as all files matched by the `dir2/**/*` glob.
//     If any of the latter files have unknown extensions – log an error for them. (*)
//
// 3. `prettier non-exists-dir "dir2/**/*""` – log an error that `non-exists-dir` resulted in 0 files
//     and prettify all files matched by the `dir2/**/*` glob.
//     If any of the latter files have unknown extensions – log an error for them. (*)
//     (Note: ESLint just prints an error and doesn't process anything.)
//
// 4. `prettier . "dir2/**/*"` – prettify all files with supported extensions in `.`
//     and all files matched by the `dir2/**/*` glob.
//     If any of the latter files have unknown extensions – log an error for them. (*)
//
// (*) That error ("No parser could be inferred for file") doesn't affect the error code.

describe("1. `prettier dir1 dir2`", () => {
  runPrettier("cli/patterns-dirs", ["dir1", "dir2", "-l"]).test({
    stderr: "",
    status: 1,
    write: []
  });
});

describe("1a. `prettier dir1 dir2` with *.foo plugin", () => {
  runPrettier("cli/patterns-dirs", [
    "dir1",
    "dir2",
    "-l",
    "--plugin=../../plugins/extensions/plugin"
  ]).test({
    stderr: "",
    status: 1,
    write: []
  });
});

describe('1b. `prettier dir1 "!dir"` - special characters in dir name', () => {
  runPrettier("cli/patterns-dirs", ["dir1", "!dir", "-l"]).test({
    stdout: expect.stringMatching(/!dir[/\\]a\.js/),
    stderr: "",
    status: 1,
    write: []
  });
});

describe("1c. `prettier dir1 empty`", () => {
  runPrettier("cli/patterns-dirs", ["dir1", "empty", "-l"]).test({
    status: 2,
    write: []
  });
});

describe('2. `prettier dir1 "dir2/**/*"`', () => {
  runPrettier("cli/patterns-dirs", ["dir1", "dir2/**/*", "-l"]).test({
    status: 1,
    write: []
  });
});

describe('3. `prettier non-exists-dir "dir2/**/*"`', () => {
  runPrettier("cli/patterns-dirs", ["non-exists-dir", "dir2/**/*", "-l"]).test({
    status: 2,
    write: []
  });
});

describe('4. `prettier . "dir2/**/*"`', () => {
  runPrettier("cli/patterns-dirs", [".", "dir2/**/*", "-l"]).test({
    status: 1,
    write: []
  });
});
