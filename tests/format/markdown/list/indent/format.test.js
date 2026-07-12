runFormatTest(import.meta, ["markdown"], { proseWrap: "always" });
runFormatTest(import.meta, ["markdown"], { proseWrap: "always", tabWidth: 4 });
runFormatTest(import.meta, ["markdown"], {
  proseWrap: "always",
  tabWidth: 999,
});
runFormatTest(import.meta, ["markdown"], { proseWrap: "always", tabWidth: 0 });
