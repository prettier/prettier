runFormatTest(import.meta, ["typescript"], {
  errors: {
    "babel-ts": ["classAbstractMixedWithModifiers.ts"],
    "oxc-ts": [
      "classAbstractProperties.ts",
      "classAbstractMixedWithModifiers.ts",
    ],
  },
});
