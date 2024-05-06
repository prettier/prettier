runFormatTest(import.meta, ["flow", "babel", "typescript"], {
  singleQuote: false,
  jsxSingleQuote: false,
});
runFormatTest(import.meta, ["flow", "babel", "typescript"], {
  singleQuote: false,
  jsxSingleQuote: true,
});
runFormatTest(import.meta, ["flow", "babel", "typescript"], {
  singleQuote: true,
  jsxSingleQuote: false,
});
runFormatTest(import.meta, ["flow", "babel", "typescript"], {
  singleQuote: true,
  jsxSingleQuote: true,
});
