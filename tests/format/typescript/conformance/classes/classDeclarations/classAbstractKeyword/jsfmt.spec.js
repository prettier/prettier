runFormatTest(import.meta, ["typescript"], {
  errors: {
    "babel-ts": ["classAbstractMixedWithModifiers.ts"],
  },
});
