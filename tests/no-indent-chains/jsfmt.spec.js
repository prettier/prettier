run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  indentChains: false
});

run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  indentChains: false,
  parenSpacing: true
});
