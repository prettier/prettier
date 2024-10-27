// [prettierx] test script notice:
// This test script runs for test files in another directory,
// **not** on any files in *this* directory.

// [FUTURE TBD] use Nodejs path function (...)
const dirPath = `${__dirname}/../../../js/break-calls`;

run_spec(dirPath, ["babel", "babel-flow", "flow", "typescript"], {
  // [prettierx] test with --space-in-parens
  spaceInParens: true,
  arrayBracketSpacing: true,
  computedPropertySpacing: true,
  typeAngleBracketSpacing: true,
  trailingComma: "none", // ("Standard JS")
});
