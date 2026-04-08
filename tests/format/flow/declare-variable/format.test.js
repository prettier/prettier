runFormatTest(import.meta, ["flow"], {
  errors: { hermes: ["multiple.js", "initializer.js"] },
});
