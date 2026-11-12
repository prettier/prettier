const typescriptErrors = [
  "comments.js",
  "mapped-types.js",
  "modifiers-and-key-remapping.js",
];

runFormatTest(import.meta, ["flow", "typescript"], {
  errors: {
    "babel-ts": typescriptErrors,
    typescript: typescriptErrors,
    "oxc-ts": typescriptErrors,
    "yuku-ts": typescriptErrors,
  },
});
