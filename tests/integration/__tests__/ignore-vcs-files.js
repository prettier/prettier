describe("ignores files in version control systems", () => {
  runCli("cli/ignore-vcs-files", [
    ".svn/file.js",
    ".hg/file.js",
    ".jj/file.js",
    "file.js",
    "-l",
  ]).test({
    status: 1,
  });
});
