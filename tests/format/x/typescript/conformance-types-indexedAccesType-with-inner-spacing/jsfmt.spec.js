// [prettierx] test script notice:
// This test script runs for test files in another directory,
// **not** on any files in *this* directory.

// [FUTURE TBD] use Nodejs path function (...)
const dirPath = `${__dirname}/../../../typescript/conformance/types/indexedAccesType`;

run_spec(dirPath, ["typescript"], {
  // [prettierx] test with --space-in-parens
  spaceInParens: true,
  typeAngleBracketSpacing: true,
  typeBracketSpacing: true,
});
