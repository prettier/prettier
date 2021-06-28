// [prettierx] test script notice:
// This test script runs for test files in parent directory,
// **not** on any files in *this* directory.

const dirPath = `${__dirname}/..`;

run_spec(dirPath, ["typescript"], {
  spaceInParens: true,
  typeAngleBracketSpacing: true,
  // "Standard JS":
  spaceBeforeFunctionParen: true,
  trailingComma: "none",
});

run_spec(dirPath, ["typescript"], {
  spaceInParens: true,
  typeAngleBracketSpacing: true,
  // "Standard JS":
  trailingComma: "none",
});
