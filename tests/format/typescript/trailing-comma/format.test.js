const errors = { "yuku-ts": ["invalid.ts"] };

runFormatTest(import.meta, ["typescript"], { trailingComma: "all", errors });
runFormatTest(import.meta, ["typescript"], { trailingComma: "es5", errors });
runFormatTest(import.meta, ["typescript"], { trailingComma: "none", errors });
