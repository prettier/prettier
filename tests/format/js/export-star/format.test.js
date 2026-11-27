runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    flow: ["export-star-as-string.js", "export-star-as-string2.js"],
  },
});
