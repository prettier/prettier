// [prettierx] test script notice:
// This test script runs for test files in another directory,
// **not** on any files in *this* directory.

const dirPath = `${__dirname}/../../../../computed_props`;

run_spec(dirPath, ["babel", "babel-flow"], {
  computedPropertySpacing: true,
});
