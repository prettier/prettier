runFormatTest(import.meta, ["typescript"], {
  errors: {
    "oxc-ts": ["const.ts"],
    "yuku-ts": ["const.ts"],
  },
});
