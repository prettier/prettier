run_spec(import.meta, ["babel", "flow"], {});
run_spec(import.meta, ["babel", "flow"], { semi: false });
run_spec(import.meta, ["babel", "flow"], {
  semi: false,
  experimentalOperatorPosition: true,
});
