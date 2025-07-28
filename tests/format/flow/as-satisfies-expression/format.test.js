runFormatTest(import.meta, ["flow"], {
  errors: {
    hermes: ["satisfies.js", "ternary.js"],
  },
});
