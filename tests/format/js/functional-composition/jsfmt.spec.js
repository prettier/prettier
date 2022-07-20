run_spec(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    acorn: [],
    espree: [],
  },
});
run_spec(import.meta, ["babel", "flow", "typescript"], {
  trailingComma: "es5",
  errors: {
    acorn: [],
    espree: [],
  },
});
