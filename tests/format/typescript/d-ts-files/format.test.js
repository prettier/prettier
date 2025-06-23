runFormatTest(import.meta, ["typescript"], {
  errors: { "oxc-ts": ["const-without-initializer.d.ts"] },
});
