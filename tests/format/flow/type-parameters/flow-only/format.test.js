runFormatTest(import.meta, ["flow"], {
  errors: {
    "babel-flow": ["const-type-params.js"],
    hermes: ["const-type-params.js"],
  },
});
