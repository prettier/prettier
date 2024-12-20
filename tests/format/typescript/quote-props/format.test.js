runFormatTest(import.meta, ["typescript"], {
  quoteProps: "as-needed",
});

runFormatTest(import.meta, ["typescript"], {
  quoteProps: "preserve",
});

runFormatTest(import.meta, ["typescript"], {
  quoteProps: "consistent",
});
