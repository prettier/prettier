runFormatTest(import.meta, ["babel", "typescript"]);
runFormatTest(import.meta, ["babel", "typescript"], {
  quoteProps: "consistent",
});
runFormatTest(import.meta, ["babel", "typescript"], { quoteProps: "preserve" });
