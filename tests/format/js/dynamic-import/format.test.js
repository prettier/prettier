runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    flow: ["assertions.js", "template-literal.js"],
    acorn: ["assertions.js"],
    espree: ["assertions.js"],
    meriyah: ["assertions.js"],
  },
});
