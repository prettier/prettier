run_spec(__dirname, ["babel", "babel-flow", "typescript"], {
  bogus1: true, // improve consistency of snapshot with prettierX 0.18.x
});
run_spec(__dirname, ["babel", "babel-flow", "typescript"], {
  breakLongMethodChains: true,
});
