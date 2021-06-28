// [prettierx] test script notice:
// This test script runs for test files in another directory,
// **not** on any files in *this* directory.

const dirPath = `${__dirname}/../../../../typescript/conformance/types/mappedType`;

run_spec(dirPath, ["typescript"], {
  typeCurlySpacing: false,
});
