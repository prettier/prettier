run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  bogus1: true, // improve consistency of snapshot with prettierX 0.18.x
});
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  bogus2: true, // improve consistency of snapshot with prettierX 0.18.x
  tabWidth: 4,
});
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  bogus3: true, // improve consistency of snapshot with prettierX 0.18.x
  useTabs: true,
});
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  useTabs: true,
  tabWidth: 4,
});
