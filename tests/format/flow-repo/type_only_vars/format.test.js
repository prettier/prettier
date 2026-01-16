runFormatTest(import.meta, ["flow"], {
  errors: {
    hermes: ["bad_shadowing.js", "good_shadowing.js"],
  },
});
