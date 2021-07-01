// [prettierx] test script notice:
// This test script runs for test files in another directory,
// **not** on any files in *this* directory.

// [FUTURE TBD] use Nodejs path function (...)
const dirPath = `${__dirname}/../../../jsx/jsx`;

run_spec(dirPath, ["babel", "babel-flow", "flow", "typescript"], {
  singleQuote: false,
  jsxSingleQuote: false,
  // [prettierx] test with --paren-spacing
  spaceInParens: true,
  arrayBracketSpacing: true,
  computedPropertySpacing: true,
  templateCurlySpacing: true,
  typeAngleBracketSpacing: true,
  // recommended:
  arrowParens: "avoid",
  trailingComma: "none", // ("Standard JS")
});
