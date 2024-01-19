runFormatTest(import.meta, ["flow", "babel", "typescript"], {
  bracketSameLine: true,
  errors: {
    typescript: ["in-end-tag.js"],
    meriyah: ["in-end-tag.js", "fragment.js"],
  },
});
