runFormatTest(import.meta, ["babel", "typescript", "flow"], {
  bracketSameLine: true,
  errors: {
    typescript: ["in-end-tag.js"],
  },
});
