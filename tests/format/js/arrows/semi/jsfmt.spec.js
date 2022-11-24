run_spec(__dirname, ["babel", "typescript"], {
  arrowParens: "always",
  semi: false,
});
run_spec(__dirname, ["babel", "typescript"], {
  arrowParens: "avoid",
  semi: false,
});
