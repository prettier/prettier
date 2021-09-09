const errors = {};

run_spec(__dirname, ["babel", "flow", "typescript"], {
  trailingComma: "es5",
  errors,
});
run_spec(__dirname, ["babel", "flow", "typescript"], {
  trailingComma: "all",
  errors,
});
run_spec(__dirname, ["babel", "flow", "typescript"], {
  arrowParens: "always",
  errors,
});
