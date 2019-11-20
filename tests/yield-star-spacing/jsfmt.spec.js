// SKIP babel parser for now
// to avoid failures that may be triggered by @babel update
// FUTURE TODO resolve the issues and test with babel parser again
run_spec(__dirname, ["flow"], {
  yieldStarSpacing: true
});
run_spec(__dirname, ["flow"], {
  yieldStarSpacing: true,
  generatorStarSpacing: true
});
run_spec(__dirname, ["flow"], {
  yieldStarSpacing: true,
  generatorStarSpacing: true,
  spaceBeforeFunctionParen: true
});
