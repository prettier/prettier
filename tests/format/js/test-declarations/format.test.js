runFormatTest(import.meta, ["babel", "flow", "typescript"]);
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  arrowParens: "avoid",
});
