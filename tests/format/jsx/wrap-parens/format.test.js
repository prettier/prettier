runFormatTest(import.meta, ["babel", "flow", "typescript"]);
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  jsxWrapParens: "never",
});
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  jsxWrapParens: "preserve",
});
