run_spec(__dirname, ["babylon", "flow", "typescript"]);
run_spec(__dirname, ["babylon", "flow", "typescript"], {
  trailingComma: "all"
});
run_spec(__dirname, ["babylon", "flow", "typescript"], {
  arrowParens: "always"
});
