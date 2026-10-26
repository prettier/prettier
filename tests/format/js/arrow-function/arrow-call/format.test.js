runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  trailingComma: "es5",
});
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  trailingComma: "all",
});
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  arrowParens: "always",
});
