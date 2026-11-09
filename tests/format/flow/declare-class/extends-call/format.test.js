runFormatTest(import.meta, ["flow"], {
  printWidth: 50,
  errors: {
    hermes: ["comments.js.flow", "extends.js.flow"],
  },
});
