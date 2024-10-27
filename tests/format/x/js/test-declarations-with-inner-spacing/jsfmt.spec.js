// [prettierx] test script notice:
// This test script runs for test files in another directory,
// **not** on any files in *this* directory.

// [FUTURE TBD] use Nodejs path function (...)
const dirPath = `${__dirname}/../../../js/test-declarations`;

run_spec(dirPath, ["babel", "babel-flow", "flow", "typescript"], {
  // [prettierx] recommended option, especially in combo with --space-in-parens
  arrowParens: "avoid",
  // [prettierx] test with --space-in-parens
  spaceInParens: true,
  arrayBracketSpacing: true,
  typeAngleBracketSpacing: true,
  templateCurlySpacing: true,
});
