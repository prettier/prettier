// [prettierx] test script notice:
// This test script runs for test files in another directory,
// **not** on any files in *this* directory.

const dirPath = `${__dirname}/../../../../ternaries`;

run_spec(dirPath, ["babel", "babel-flow", "flow", "typescript"], {
  spaceInParens: true,
  arrayBracketSpacing: true,
  computedPropertySpacing: true,
  spaceUnaryOps: true,
  templateCurlySpacing: true,
  // [prettierx] recommended option:
  arrowParens: "avoid",
  // [prettierx] "Standard JS" setting:
  trailingComma: "none",
});
