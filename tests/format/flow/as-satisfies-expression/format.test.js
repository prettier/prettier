runFormatTest(import.meta, ["flow"], {
  errors: {
    "babel-flow": true,
    hermes: ["satisfies.js", "ternary.js"],
  },
});
