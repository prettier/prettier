runFormatTest(import.meta, ["flow"], {
  errors: {
    "babel-flow": ["conditional.js"],
  },
});
