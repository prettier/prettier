run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  importFormatting: "oneline",
});
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  importFormatting: "auto",
  trailingComma: "none",
});
