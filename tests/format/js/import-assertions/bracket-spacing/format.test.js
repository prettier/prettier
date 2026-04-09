runFormatTest(import.meta, ["oxc", "typescript", "hermes"], {
  bracketSpacing: false,
  errors: {
    "babel-ts": ["static-import.js", "re-export.js", "empty.js"],
    hermes: ["static-import.js", "empty.js", "re-export.js"],
  },
});
