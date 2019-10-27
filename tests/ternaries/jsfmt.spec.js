run_spec(__dirname, ["babel", "flow", "typescript"], {
  alignTernaryLines: true
});
run_spec(__dirname, ["babel", "flow", "typescript"], {
  alignTernaryLines: true,
  tabWidth: 4
});
run_spec(__dirname, ["babel", "flow", "typescript"], {
  alignTernaryLines: true,
  useTabs: true
});
run_spec(__dirname, ["babel", "flow", "typescript"], {
  alignTernaryLines: true,
  useTabs: true,
  tabWidth: 4
});
run_spec(__dirname, ["flow", "typescript"], { alignTernaryLines: false });
run_spec(__dirname, ["flow", "typescript"], {
  alignTernaryLines: false,
  tabWidth: 4
});

run_spec(__dirname, ["babel", "flow", "typescript"], {
  alignTernaryLines: true,
  parenSpacing: true
});
