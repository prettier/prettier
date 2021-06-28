// [prettierx] test script notice:
// This test script runs for test files in another directory,
// **not** on any files in *this* directory.

const dirPath = `${__dirname}/../../../../binary-expressions`;

run_spec(dirPath, ["babel", "babel-flow", "flow", "typescript"], {
  // [prettierx] test with --paren-spacing
  spaceInParens: true,
  computedPropertySpacing: true,
  spaceUnaryOps: true,
  templateCurlySpacing: true,
});
