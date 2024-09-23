runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    acorn: ["child.js"],
    espree: ["child.js"],
  },
});
