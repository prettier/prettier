// [prettierx] test script notice:
// This test script runs for test files in another directory,
// **not** on any files in *this* directory.

// [FUTURE TBD] use Nodejs path function (...)
const dirPath = `${__dirname}/../../../postcss/scss/scss`;

run_spec(dirPath, ["scss"], {
  // [prettierx] test with --css-paren-spacing
  cssParenSpacing: true,
});
