// [prettierx] test script notice:
// This test script runs for test files in another directory,
// **not** on any files in *this* directory.

const dirPath = `${__dirname}/../../../../typescript_function_type`;

run_spec(dirPath, ["typescript"], {
  // [prettierx] test with --paren-spacing
  spaceInParens: true,
});
