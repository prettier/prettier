// [prettierx] test script notice:
// This test script runs for test files in another directory,
// **not** on any files in *this* directory.

// [FUTURE TBD] use Nodejs path function (...)
const dirPath = `${__dirname}/../../../js/comments-closure-typecast`;

run_spec(dirPath, ["babel", "babel-flow"], {
  // [prettierx] test with --paren-spacing
  spaceInParens: true,
  arrayBracketSpacing: true,
  computedPropertySpacing: true,
  // [prettierx] recommended option:
  arrowParens: "avoid",
  // [prettierx] "Standard JS" setting:
  trailingComma: "none",
});
