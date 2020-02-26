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

testPatterns("1", ["dir1", "dir2"]);
testPatterns("1a - with *.foo plugin", [
  "dir1",
  "dir2",
  "--plugin=../../plugins/extensions/plugin"
]);
testPatterns("1b - special characters in dir name", ["dir1", "!dir"], {
  stdout: expect.stringMatching(/!dir[/\\]a\.js/)
});
testPatterns("1c", ["dir1", "empty"], { status: 2 });

testPatterns("2", ["dir1", "dir2/**/*"], { status: 1 });

testPatterns("3", ["non-exists-dir", "dir2/**/*"], { status: 2 });

testPatterns("4", [".", "dir2/**/*"], { status: 1 });

describe("Negative patterns", () => {
  testPatterns("1", ["dir1", "!dir1/nested1/*"]);
  testPatterns("2", ["dir1", "!dir1/nested1"]);
});

function testPatterns(namePrefix, cliArgs, testOptions = {}) {
  const testName =
    namePrefix +
    ": prettier " +
    cliArgs.map(arg => (/^[\w.=/-]+$/.test(arg) ? arg : `'${arg}'`)).join(" ");

  describe(testName, () => {
    runPrettier("cli/patterns-dirs", [...cliArgs, "-l"]).test({
      write: [],
      ...(!("status" in testOptions) && { stderr: "", status: 1 }),
      ...testOptions
    });
  });
}
