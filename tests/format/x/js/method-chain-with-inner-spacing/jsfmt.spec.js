// [prettierx] test script notice:
// This test script runs for test files in another directory,
// **not** on any files in *this* directory.

// [FUTURE TBD] use Nodejs path function (...)
const dirPath = `${__dirname}/../../../js/method-chain`;

run_spec(dirPath, ["babel", "babel-flow", "flow", "typescript"], {
  // [prettierx] recommended setting with --space-in-parens
  arrowParens: "avoid",
  // [prettierx] test with --space-in-parens
  spaceInParens: true,
  arrayBracketSpacing: true,
  computedPropertySpacing: true,
  spaceUnaryOps: true,
  templateCurlySpacing: true,
  typeAngleBracketSpacing: true,
});
