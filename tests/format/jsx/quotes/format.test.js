runFormatTest(import.meta, ["babel", "typescript", "flow"], {
  singleQuote: false,
  jsxSingleQuote: false,
});
runFormatTest(import.meta, ["babel", "typescript", "flow"], {
  singleQuote: false,
  jsxSingleQuote: true,
});
runFormatTest(import.meta, ["babel", "typescript", "flow"], {
  singleQuote: true,
  jsxSingleQuote: false,
});
runFormatTest(import.meta, ["babel", "typescript", "flow"], {
  singleQuote: true,
  jsxSingleQuote: true,
});
