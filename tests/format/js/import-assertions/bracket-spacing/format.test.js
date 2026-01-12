runFormatTest(import.meta, ["oxc", "typescript"], {
  bracketSpacing: false,
  errors: { "babel-ts": ["static-import.js", "re-export.js", "empty.js"] },
});
