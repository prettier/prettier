run_spec(import.meta, ["babel", "flow", "typescript"]);
run_spec(import.meta, ["babel", "flow", "typescript"], {
  htmlWhitespaceSensitivity: "ignore",
});
run_spec(import.meta, ["babel", "flow", "typescript"], {
  trailingComma: "es5",
});
