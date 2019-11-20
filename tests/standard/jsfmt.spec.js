// SKIP babel parser for now
// to avoid failures that may be triggered by @babel update
// FUTURE TODO resolve the issues and test with babel parser again
run_spec(__dirname, ["flow", "typescript"], {
  endOfLine: "lf",
  yieldStarSpacing: true,
  generatorStarSpacing: true,
  spaceBeforeFunctionParen: true,
  singleQuote: true,
  jsxSingleQuote: true,
  semi: false,
  alignTernaryLines: false
});
