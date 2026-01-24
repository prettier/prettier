runFormatTest(import.meta, ["flow", "typescript"], {
  singleQuote: false,
  jsxSingleQuote: false,
});
runFormatTest(import.meta, ["flow", "typescript"], {
  singleQuote: false,
  jsxSingleQuote: true,
});
runFormatTest(import.meta, ["flow", "typescript"], {
  singleQuote: true,
  jsxSingleQuote: false,
});
runFormatTest(import.meta, ["flow", "typescript"], {
  singleQuote: true,
  jsxSingleQuote: true,
});
