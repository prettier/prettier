// [prettierx] test script notice:
// This test script runs for test files in parent directory,
// **not** on any files in *this* directory.

const dirPath = `${__dirname}/..`;

run_spec(dirPath, ["babel", "babel-flow", "flow", "typescript"], {
  // "Standard JS":
  alignObjectProperties: true,
  // prettierx: test with --space-in-parens
  computedPropertySpacing: true,
  // "Standard JS":
  trailingComma: "none",
});
