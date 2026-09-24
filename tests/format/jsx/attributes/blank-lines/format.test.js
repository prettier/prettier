runFormatTest(import.meta, ["flow", "babel", "typescript"]);
runFormatTest(import.meta, ["flow", "babel", "typescript"], {
  singleAttributePerLine: true,
});
