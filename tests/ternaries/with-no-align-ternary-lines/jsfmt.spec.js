// [prettierx] test script notice:
// This test script runs for test files in parent directory,
// **not** on any files in *this* directory.

const dirpath = `${__dirname}/..`;

run_spec(dirpath, ["babel", "babel-flow", "flow", "typescript"], {
  // option(s):
  alignTernaryLines: false
});

run_spec(dirpath, ["babel", "babel-flow", "flow", "typescript"], {
  alignTernaryLines: false,
  tabWidth: 4
});
