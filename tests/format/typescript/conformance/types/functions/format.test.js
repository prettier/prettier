runFormatTest(import.meta, ["typescript"], {
  errors: {
    "babel-ts": ["functionOverloadErrorsSyntax.ts"],
    "oxc-ts": ["functionOverloadErrorsSyntax.ts"],
  },
});
