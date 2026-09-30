runFormatTest(import.meta, ["typescript"], {
  errors: { "babel-ts": ["keywords.ts", "module.ts"] },
});
