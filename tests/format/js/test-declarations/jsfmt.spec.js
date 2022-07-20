run_spec(import.meta, ["babel", "flow", "typescript"]);
run_spec(import.meta, ["babel", "flow", "typescript"], {
  arrowParens: "avoid",
});
run_spec(import.meta, ["babel", "flow", "typescript"], {
  trailingComma: "es5",
});
