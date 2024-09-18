runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    flow: ["v-flag.js"],
    acorn: ["regexp-modifiers.js"],
    espree: ["regexp-modifiers.js"],
    meriyah: ["regexp-modifiers.js"],
  },
});
