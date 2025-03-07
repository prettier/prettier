runFormatTest(import.meta, ["yaml"]);
runFormatTest(import.meta, ["yaml"], { trailingComma: "none" });
runFormatTest(import.meta, ["yaml"], { trailingComma: "es5" });
runFormatTest(import.meta, ["yaml"], { trailingComma: "all" });
