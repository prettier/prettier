runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  destructuringWrap: "preserve",
  errors: {
    hermes: ["destructuring.js"],
  },
});
