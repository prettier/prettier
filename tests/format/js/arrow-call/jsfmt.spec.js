const errors = {};

run_spec(import.meta, ["babel", "flow", "typescript"], {
  trailingComma: "es5",
  errors,
});
run_spec(import.meta, ["babel", "flow", "typescript"], {
  trailingComma: "all",
  errors,
});
run_spec(import.meta, ["babel", "flow", "typescript"], {
  arrowParens: "always",
  errors,
});
