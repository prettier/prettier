runFormatTest(import.meta, ["flow"], {
  errors: {
    "babel-flow": ["extends-bound.js"],
  },
});
