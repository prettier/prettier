runFormatTest(import.meta, ["markdown"]);
runFormatTest(import.meta, ["markdown"], { proseWrap: "never" });
runFormatTest(import.meta, ["markdown"], { proseWrap: "always" });
runFormatTest(import.meta, ["markdown"], { proseWrap: "preserve" });
