const errors = {
  espree: ["class-property.js"],
};

run_spec(__dirname, ["babel", "flow", "typescript"], {
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
