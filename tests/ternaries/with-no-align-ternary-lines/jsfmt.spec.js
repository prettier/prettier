// NOTICE: This test script runs for test files in ..,
// NOT on any files in the same subdirectory.

const dirpath = `${__dirname}/..`;

run_spec(dirpath, ["babel", "flow", "typescript"], {
  // option(s):
  alignTernaryLines: false
});

run_spec(dirpath, ["babel", "flow", "typescript"], {
  alignTernaryLines: false,
  tabWidth: 4
});
