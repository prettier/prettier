runFormatTest(import.meta, ["typescript"], {
  errors: { "babel-ts": ["declareDottedModuleName.ts", "privacyGloImport.ts"] },
});
