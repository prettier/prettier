runFormatTest(import.meta, ["typescript"], {
  errors: { "babel-ts": ["initializer-ambient-context.ts"] },
});
