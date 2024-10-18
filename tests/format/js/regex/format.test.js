runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    acorn: ["regexp-modifiers.js"],
    espree: ["regexp-modifiers.js"],
    meriyah: ["regexp-modifiers.js"],
  },
});
