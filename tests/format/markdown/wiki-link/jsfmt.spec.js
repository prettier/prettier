runFormatTest(import.meta, ["markdown"], { proseWrap: "always" });
runFormatTest(import.meta, ["markdown"], {
  proseWrap: "always",
  singleQuote: true,
});
runFormatTest(import.meta, ["markdown"], { proseWrap: "never" });
runFormatTest(import.meta, ["markdown"], { proseWrap: "preserve" });
