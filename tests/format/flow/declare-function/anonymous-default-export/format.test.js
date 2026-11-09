runFormatTest(import.meta, ["flow"], {
  errors: {
    hermes: [
      "comments.js.flow",
      "function-return.js.flow",
      "generic.js.flow",
      "anonymous.js.flow",
      "generic-function-return.js.flow",
    ],
  },
});
