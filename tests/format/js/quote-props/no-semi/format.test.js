runFormatTest(import.meta, ["babel"], { semi: false });
runFormatTest(import.meta, ["babel"], { semi: false, quoteProps: "preserve" });
runFormatTest(import.meta, ["babel"], {
  semi: false,
  quoteProps: "consistent",
});
