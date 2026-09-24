runFormatTest(import.meta, ["flow"], {
  errors: { hermes: ["import-type.js"] },
  printWidth: 50,
});
