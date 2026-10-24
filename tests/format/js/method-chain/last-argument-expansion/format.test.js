runFormatTest(import.meta, ["babel", "flow", "typescript"]);
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  printWidth: 81,
});
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  printWidth: 100,
});
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  printWidth: 100,
  singleQuote: true,
});
