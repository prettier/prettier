runFormatTest(import.meta, ["flow"], {
  quoteProps: "as-needed",
});

runFormatTest(import.meta, ["flow"], {
  quoteProps: "preserve",
});

runFormatTest(import.meta, ["flow"], {
  quoteProps: "consistent",
});

runFormatTest(import.meta, ["flow"], {
  quoteProps: "consistent",
  singleQuote: true,
});
