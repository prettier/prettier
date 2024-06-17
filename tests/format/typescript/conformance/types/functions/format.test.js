runFormatTest(import.meta, ["typescript"], {
  errors: { "babel-ts": ["functionOverloadErrorsSyntax.ts"] },
});
