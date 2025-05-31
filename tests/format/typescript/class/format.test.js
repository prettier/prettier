runFormatTest(import.meta, ["typescript"], {
  errors: {
    "oxc-ts": [
      // TODO: Ask typescript-eslint to throw
      "constructor.ts",
    ],
  },
});
