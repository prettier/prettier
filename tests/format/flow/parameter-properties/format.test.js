runFormatTest(import.meta, ["flow"], {
  errors: {
    hermes: ["comments.js", "parameter-property.js", "properties.js"],
  },
});
