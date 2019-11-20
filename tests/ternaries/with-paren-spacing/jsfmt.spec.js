// NOTICE: This test script runs for test files in ..,
// NOT on any files in the same subdirectory.

// SKIP babel parser for now
// to avoid failures that may be triggered by @babel update
// FUTURE TODO resolve the issues and test with babel parser again

const dirpath = `${__dirname}/..`;

run_spec(dirpath, ["flow", "typescript"], {
  alignTernaryLines: true,
  parenSpacing: true
});
