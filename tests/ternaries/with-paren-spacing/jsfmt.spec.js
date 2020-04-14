// NOTICE: This test script runs for test files in ..,
// NOT on any files in the same subdirectory.

const dirpath = `${__dirname}/..`;

run_spec(dirpath, ["babel", "babel-flow", "flow", "typescript"], {
  alignTernaryLines: true,
  parenSpacing: true
});
