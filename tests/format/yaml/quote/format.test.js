runFormatTest(import.meta, ["yaml"]);
runFormatTest(import.meta, ["yaml"], { singleQuote: true });
runFormatTest(import.meta, ["yaml"], { proseWrap: "never" });
runFormatTest(import.meta, ["yaml"], { proseWrap: "always" });
