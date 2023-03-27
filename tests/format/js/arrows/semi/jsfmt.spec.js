run_spec(import.meta, ["babel", "typescript"], {
  arrowParens: "always",
  semi: false,
});
run_spec(import.meta, ["babel", "typescript"], {
  arrowParens: "avoid",
  semi: false,
});
