runFormatTest(import.meta, ["json"], { objectWrap: "collapse" });
runFormatTest(import.meta, ["json"], { trailingComma: "es5" });
runFormatTest(import.meta, ["json"], { trailingComma: "all" });
runFormatTest(import.meta, ["json5"], { trailingComma: "es5" });
runFormatTest(import.meta, ["json5"], { trailingComma: "all" });
runFormatTest(import.meta, ["json-stringify"]);
