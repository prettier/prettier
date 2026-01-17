runFormatTest(import.meta, ["typescript"], {
  errors: {
    typescript: ["abstract-method.ts"],
    "oxc-ts": ["abstract-method.ts"],
    "babel-ts": ["issue-9102.ts"],
  },
});
