// [prettierx] test script notice:
// This test script runs for test files in parent directory,
// **not** on any files in *this* directory.

const dirPath = `${__dirname}/..`;

run_spec(dirPath, ["babel", "babel-flow", "flow", "typescript"], {
  indentChains: false,
  spaceInParens: true,
  spaceUnaryOps: true,
  // recommended:
  arrowParens: "avoid",
});
