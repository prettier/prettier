// [prettierx] test script notice:
// This test script runs for test files in another directory,
// **not** on any files in *this* directory.

// [FUTURE TBD] use Nodejs path function (...)
const dirPath = `${__dirname}/../../../js/if`;

run_spec(dirPath, ["babel", "babel-flow", "flow", "typescript"], {
  // [prettierx] test with --break-before-else
  breakBeforeElse: true,
  // recommended:
  trailingComma: "none", // ("Standard JS")
});
