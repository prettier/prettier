run_spec(__dirname, ["babel", "flow", "typescript"], {
  errors: { espree: true },
});
run_spec(__dirname, ["babel", "flow", "typescript"], {
  trailingComma: "all",
  errors: { espree: true },
});
run_spec(__dirname, ["babel", "flow", "typescript"], {
  arrowParens: "always",
  errors: { espree: true },
});
