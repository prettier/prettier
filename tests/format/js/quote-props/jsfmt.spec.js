const errors = {};

runFormatTest(import.meta, ["babel"], {
  quoteProps: "as-needed",
  errors,
});

runFormatTest(import.meta, ["babel"], {
  quoteProps: "preserve",
  errors,
});

runFormatTest(import.meta, ["babel"], {
  quoteProps: "consistent",
  errors,
});

runFormatTest(import.meta, ["babel"], {
  quoteProps: "consistent",
  singleQuote: true,
  errors,
});
