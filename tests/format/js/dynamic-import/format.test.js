runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    flow: ["assertions.js", "template-literal.js", "import-phase.js"],
    acorn: ["import-phase.js"],
    espree: ["import-phase.js"],
    meriyah: ["import-phase.js"],
  },
});
