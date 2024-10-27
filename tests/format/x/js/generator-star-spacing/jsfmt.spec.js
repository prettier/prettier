run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  bogus1: true, // improve consistency of snapshot with prettierX 0.18.x
  generatorStarSpacing: true,
});
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  generatorStarSpacing: true,
  spaceBeforeFunctionParen: true,
});
