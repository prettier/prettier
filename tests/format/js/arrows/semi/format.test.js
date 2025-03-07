runFormatTest(import.meta, ["babel", "typescript"], {
  arrowParens: "always",
  semi: false,
});
runFormatTest(import.meta, ["babel", "typescript"], {
  arrowParens: "avoid",
  semi: false,
});
