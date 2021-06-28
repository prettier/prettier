// [prettierx] test script notice:
// This test script runs for test files in parent directory,
// **not** on any files in *this* directory.

const dirpath = `${__dirname}/..`;

run_spec(dirpath, ["babel", "babel-flow", "flow", "typescript"], {
  // "Standard JS":
  alignObjectProperties: true,
  // prettierx: test with --paren-spacing
  computedPropertySpacing: true,
  // "Standard JS":
  trailingComma: "none",
});
