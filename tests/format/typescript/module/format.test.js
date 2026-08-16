runFormatTest(import.meta, ["typescript"], {
  errors: { "babel-ts": ["global.ts", "keyword.ts", "module-nested.ts"] },
});
