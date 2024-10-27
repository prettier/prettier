// [prettierx] test script notice:
// This test script runs for test files in parent directory,
// **not** on any files in *this* directory.

const dirPath = `${__dirname}/..`;

run_spec(dirPath, ["typescript"], {
  spaceInParens: true,
  yieldStarSpacing: true,
  generatorStarSpacing: true,
  typeAngleBracketSpacing: true,
  spaceBeforeFunctionParen: true,
  singleQuote: true,
  jsxSingleQuote: true,
  semi: false,
});
