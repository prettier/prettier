run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  bogus1: true, // improve consistency of snapshot with prettierX 0.18.x
  yieldStarSpacing: true,
});
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  bogus2: true, // improve consistency of snapshot with prettierX 0.18.x
  yieldStarSpacing: true,
  generatorStarSpacing: true,
});
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  yieldStarSpacing: true,
  generatorStarSpacing: true,
  spaceBeforeFunctionParen: true,
});
