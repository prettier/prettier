runFormatTest(import.meta, ["typescript"], {
  errors: {
    typescript: ["abstract-method.ts"],
    "babel-ts": ["issue-9102.ts"],
  },
});
