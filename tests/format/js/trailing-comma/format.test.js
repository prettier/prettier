runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  trailingComma: "none",
});
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  trailingComma: "all",
});
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  trailingComma: "es5",
});
