import runPrettier from "../run-prettier.js";
import jestPathSerializer from "../path-serializer.js";

expect.addSnapshotSerializer(jestPathSerializer);

describe("ignores files in version control systems", () => {
  runPrettier("cli/ignore-vcs-files", [
    ".svn/file.js",
    ".hg/file.js",
    "file.js",
    "-l",
  ]).test({
    status: 1,
  });
});
