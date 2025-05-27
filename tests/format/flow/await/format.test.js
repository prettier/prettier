runFormatTest(import.meta, ["flow"], {
  errors: {
    "babel-flow": ["await-keywords.js"],
    hermes: ["await-keywords.js"],
  },
});
