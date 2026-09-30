runFormatTest(import.meta, ["babel", "typescript", "flow"], {
  errors: {
    acorn: ["child.js"],
    espree: ["child.js"],
  },
});
