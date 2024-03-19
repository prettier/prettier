runFormatTest(import.meta, ["babel"], { quoteProps: "as-needed" });
runFormatTest(import.meta, ["babel"], { quoteProps: "preserve" });
runFormatTest(import.meta, ["babel"], { quoteProps: "consistent" });
runFormatTest(import.meta, ["babel"], {
  quoteProps: "consistent",
  singleQuote: true,
});
