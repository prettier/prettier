run_spec(import.meta, ["babel", "flow", "typescript"]);
run_spec(import.meta, ["babel", "flow", "typescript"], { tabWidth: 4 });
run_spec(import.meta, ["babel", "flow", "typescript"], { useTabs: true });
run_spec(import.meta, ["babel", "flow", "typescript"], {
  useTabs: true,
  tabWidth: 4,
});

run_spec(import.meta, ["babel", "flow", "typescript"], { experimentalTernaries: true });
run_spec(import.meta, ["babel", "flow", "typescript"], { experimentalTernaries: true, tabWidth: 4 });
run_spec(import.meta, ["babel", "flow", "typescript"], { experimentalTernaries: true, useTabs: true });
run_spec(import.meta, ["babel", "flow", "typescript"], {
  experimentalTernaries: true,
  useTabs: true,
  tabWidth: 4,
});
