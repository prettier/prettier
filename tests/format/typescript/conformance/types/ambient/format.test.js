runFormatTest(import.meta, ["typescript"], {
  errors: { "babel-ts": ["ambientDeclarations.ts"] },
});
