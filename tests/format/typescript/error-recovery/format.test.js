const errors = { "babel-ts": ["jsdoc_only_types.ts", "index-signature.ts"] };
runFormatTest(import.meta, ["typescript"], { errors });
runFormatTest(import.meta, ["typescript"], { trailingComma: "es5", errors });
runFormatTest(import.meta, ["typescript"], { trailingComma: "all", errors });
