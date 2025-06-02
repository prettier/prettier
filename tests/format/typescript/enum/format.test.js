runFormatTest(import.meta, ["typescript"], {
  errors: {
    "babel-ts": ["computed-members.ts"],
    "oxc-ts": ["computed-members.ts"],
  },
});
