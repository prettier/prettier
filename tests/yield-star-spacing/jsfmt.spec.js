run_spec(__dirname, ["babel", "flow"], {
  yieldStarSpacing: true
});
run_spec(__dirname, ["babel", "flow"], {
  yieldStarSpacing: true,
  generatorStarSpacing: true
});
run_spec(__dirname, ["babel", "flow"], {
  yieldStarSpacing: true,
  generatorStarSpacing: true,
  spaceBeforeFunctionParen: true
});
