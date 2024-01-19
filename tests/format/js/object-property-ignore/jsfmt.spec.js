const parser = ["babel", "flow", "typescript"];

runFormatTest(import.meta, parser, { trailingComma: "es5" });
runFormatTest(import.meta, parser, { trailingComma: "none" });
runFormatTest(import.meta, parser, { trailingComma: "all" });
