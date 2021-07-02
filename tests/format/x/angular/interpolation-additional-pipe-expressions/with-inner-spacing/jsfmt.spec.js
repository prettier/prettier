// [prettierx] test script notice:
// This test script runs for test files in parent directory,
// **not** on any files in *this* directory.

const dirPath = `${__dirname}/..`;

run_spec(dirPath, ["__ng_interpolation"], {
  // [prettierx] test with --space-in-parens
  spaceInParens: true,
  computedPropertySpacing: true,
  trailingComma: "none",
  spaceUnaryOps: true,
});
