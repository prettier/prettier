// [prettierx] test script notice:
// This test script runs for test files in parent directory,
// **not** on any files in *this* directory.

const dirpath = `${__dirname}/..`;

run_spec(dirpath, ["typescript"], {
  parenSpacing: true,
  // "Standard JS":
  spaceBeforeFunctionParen: true,
  trailingComma: "none",
});

run_spec(dirpath, ["typescript"], {
  parenSpacing: true,
  // "Standard JS":
  trailingComma: "none",
});
