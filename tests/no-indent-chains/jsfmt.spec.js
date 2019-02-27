run_spec(__dirname, ["babel", "flow", "typescript"], { indentChains: false });

run_spec(__dirname, ["babel", "flow", "typescript"], {
  indentChains: false,
  parenSpacing: true
});
