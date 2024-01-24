const errors = {};

runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  trailingComma: "es5",
  errors,
});
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  trailingComma: "all",
  errors,
});
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  arrowParens: "always",
  errors,
});
